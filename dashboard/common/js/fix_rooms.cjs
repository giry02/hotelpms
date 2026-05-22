const fs = require('fs');
const path = 'E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js';
let code = fs.readFileSync(path, 'utf8');

const newRooms = [
    {id:'0301', floor:3, type:'Standard', status:'vacant-clean', guest:'', building:'Main'},
    {id:'0302', floor:3, type:'Standard', status:'occupied', guest:'Park Soo', building:'Main'},
    {id:'0303', floor:3, type:'Standard', status:'vacant-clean', guest:'', building:'Main'},
    {id:'0501', floor:5, type:'Standard', status:'occupied', guest:'Lee Ji', building:'Main'},
    {id:'0502', floor:5, type:'Standard', status:'vacant-clean', guest:'', building:'Main'},
    {id:'0503', floor:5, type:'Standard', status:'occupied', guest:'Choi Min', building:'Main'},
    {id:'0701', floor:7, type:'Deluxe', status:'vacant-clean', guest:'', building:'Main'},
    {id:'0702', floor:7, type:'Deluxe', status:'vacant-clean', guest:'', building:'Main'},
    {id:'0703', floor:7, type:'Deluxe', status:'occupied', guest:'Kim Jin', building:'Main'},
    {id:'0801', floor:8, type:'Deluxe', status:'vacant-clean', guest:'', building:'Main'},
    {id:'0805', floor:8, type:'Deluxe', status:'occupied', guest:'Han So', building:'Main'},
    {id:'0807', floor:8, type:'Deluxe', status:'vacant-clean', guest:'', building:'Main'},
    {id:'1001', floor:10, type:'Suite', status:'occupied', guest:'Jeong Tae', building:'Main'},
    {id:'1002', floor:10, type:'Suite', status:'vacant-clean', guest:'', building:'Main'},
    {id:'1201', floor:12, type:'Premier', status:'occupied', guest:'Kang Do', building:'Main'},
    {id:'1205', floor:12, type:'Premier', status:'vacant-clean', guest:'', building:'Main'},
    {id:'1401', floor:14, type:'Penthouse', status:'occupied', guest:'Bae Yoon', building:'Main'},
    {id:'1402', floor:14, type:'Penthouse', status:'vacant-clean', guest:'', building:'Main'},
    {id:'PH01', floor:15, type:'Penthouse', status:'occupied', guest:'Yoon Ji', building:'Main'},
    {id:'PH02', floor:15, type:'Penthouse', status:'vacant-clean', guest:'', building:'Main'}
];

const fallbackStr = JSON.stringify(newRooms, null, 4);

code = code.replace(/const _fallbackRooms = \[[\s\S]*?\];/, 'const _fallbackRooms = ' + fallbackStr + ';');

fs.writeFileSync(path, code);
