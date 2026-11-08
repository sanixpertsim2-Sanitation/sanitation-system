import test from 'node:test';
import assert from 'node:assert/strict';
import { insertDamageReport, persistDamageUpdate, mergeDamageReports } from '../src/lib/damagePersistence.mjs';
import { sendDamageNotification } from '../src/lib/damageNotifications.mjs';
const id = '11111111-1111-4111-8111-111111111111';
const row = { id, status: 'Open', description: 'guard', photo_data: 'data:image/png;base64,AA==', created_at: '2026-11-08' };
function database(result) {
  const calls = [];
  const client = { from(table) { calls.push(['from',table]); return this; }, insert(data) {calls.push(['insert',data]); return this;}, update(data) {calls.push(['update',data]);return this;}, eq(...args) {calls.push(['eq',...args]);return this;}, select() {return this;}, async single() {calls.push(['awaited']);return result;} };
  return {client,calls};
}
test('insert awaits database and returns database ID instead of legacy device ID', async () => {
 const {client,calls}=database({data:row});
 const saved=await insertDamageReport(client,{id:'damage-123',lineName:'MACY',photo:{dataUrl:row.photo_data}});
 assert.equal(saved.id,id); assert.equal(calls.at(-1)[0],'awaited'); assert.equal(calls[1][1].id,undefined); assert.equal(saved.photo.dataUrl,row.photo_data);
});
test('database missing, rejected writes and missing rows never count as saved', async () => {
 await assert.rejects(insertDamageReport(null,{}));
 for(const result of [{error:{message:'RLS'}},{data:null},{data:{}}]) {
  await assert.rejects(insertDamageReport(database(result).client,{}));
  await assert.rejects(persistDamageUpdate(database(result).client,id,{status:'Closed'}));
 }
});
test('updates use persisted UUID and do not erase unrelated closure fields', async () => {
 const {client,calls}=database({data:{...row,status:'Handover'}});
 const saved=await persistDamageUpdate(client,id,{status:'Handover'});
 assert.equal(saved.status,'Handover');assert.deepEqual(calls[1],['update',{status:'Handover'}]);assert.deepEqual(calls[2],['eq','id',id]);
 await assert.rejects(persistDamageUpdate(client,'damage-123',{status:'Closed'}),/older report/);
});
test('closure data and photo are persisted and returned',async()=>{
 const {client,calls}=database({data:{...row,status:'Closed',fixed_by:'Team',closed_at:'now',close_photo_data:'photo'}});
 const saved=await persistDamageUpdate(client,id,{status:'Closed',fixedBy:'Team',closedAt:'now',closePhoto:{dataUrl:'photo'}});
 assert.deepEqual(calls[1][1],{status:'Closed',fixed_by:'Team',closed_at:'now',close_photo_data:'photo'});assert.equal(saved.closePhoto.dataUrl,'photo');
});
test('reload preserves legacy device data and uses current database rows',()=>{
 const local=[{id:'damage-123'},{id,status:'Open'}],remote=[{id,status:'Closed'}];
 assert.deepEqual(mergeDamageReports(local,remote),[remote[0],local[0]]);
});
test('client never treats HTTP errors, mock success, invalid JSON or network failure as sent',async()=>{
 for (const [ok,body] of [[false,{ok:true,sent:true}],[true,{ok:true}],[true,{ok:true,sent:true,mocked:true}],[true,{ok:false}]]) {
 assert.equal(await sendDamageNotification(row,{fetcher:async()=>({ok,json:async()=>body})}),false);
 }
 assert.equal(await sendDamageNotification(row,{fetcher:async()=>{throw Error('network');}}),false);
 assert.equal(await sendDamageNotification(row,{fetcher:async()=>({ok:true,json:async()=>{throw Error('json');}})}),false);
});
test('client sends correct address and complete saved closure details',async()=>{
 let payload;
 const report={...row,lineName:'MACY',closedAt:'now',fixedBy:'Team',closePhoto:{dataUrl:'closed-photo'}};
 const sent=await sendDamageNotification(report,{photo:report.closePhoto,fetcher:async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({ok:true,sent:true})};}});
 assert.equal(sent,true);assert.equal(payload.to,'adarsh@sanixperts.ca');assert.equal(payload.photoData,'closed-photo');assert.equal(payload.fixedBy,'Team');assert.equal(payload.lineName,'MACY');
});
