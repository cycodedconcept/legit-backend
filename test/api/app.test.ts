import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import pino from 'pino';
import request from 'supertest';
import { createApp } from '../../src/app.js';
const silent = pino({level:'silent'});
describe('operational HTTP contract', () => {
  it('returns health envelope and server-generated request IDs', async () => {
    const app=createApp(async () => {}, silent);
    const first=await request(app).get('/health').set('X-Request-ID','untrusted').expect(200);
    const second=await request(app).get('/health').expect(200);
    assert.deepEqual(first.body.data,{status:'ok'});
    assert.equal(first.body.meta.requestId,first.headers['x-request-id']);
    assert.notEqual(first.body.meta.requestId,second.body.meta.requestId);
    assert.notEqual(first.body.meta.requestId,'untrusted');
  });
  it('reports ready and recovers after a dependency outage', async () => {
    let failed=true;
    const app=createApp(async () => {if(failed) throw new Error('SECRET_SENTINEL');}, silent);
    const result=await request(app).get('/ready').expect(503);
    assert.equal(result.body.error.code,'NOT_READY');
    assert.doesNotMatch(result.text,/SECRET_SENTINEL/);
    await request(app).get('/health').expect(200);
    failed=false;
    await request(app).get('/ready').expect(200);
  });
  it('returns a versioned unknown-route error', async () => {
    const result=await request(createApp(async () => {},silent)).get('/api/v1/missing').expect(404);
    assert.equal(result.body.error.code,'NOT_FOUND');
  });
  it('rejects malformed and oversized JSON without echoing input', async () => {
    const app=createApp(async () => {},silent);
    const result=await request(app).post('/api/v1/missing').type('json').send('{"SECRET_SENTINEL":').expect(400);
    assert.equal(result.body.error.code,'INVALID_JSON');
    assert.doesNotMatch(result.text,/SECRET_SENTINEL/);
    await request(app).post('/api/v1/missing').send({body:'x'.repeat(17000)}).expect(413);
  });
  it('omits secrets and identity data from request and error logs', async () => {
    let output='';
    const stream=new Writable({write(chunk,_encoding,callback){output+=chunk.toString();callback();}});
    const app=createApp(async () => {throw new Error('SECRET_SENTINEL');},pino({},stream));
    await request(app).get('/ready?token=SECRET_SENTINEL').set('Authorization','Bearer SECRET_SENTINEL').set('Cookie','identity=SECRET_SENTINEL').expect(503);
    assert.doesNotMatch(output,/SECRET_SENTINEL/);
    assert.match(output,/requestId/);
  });
});
