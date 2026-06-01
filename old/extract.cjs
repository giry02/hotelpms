const fs=require('fs');
const html=fs.readFileSync('E:/AI_Project/Hotel_PMS/dashboard/operations/rooms.html', 'utf8');
const scripts=[...html.matchAll(/<script>(.*?)<\/script>/gs)].map(m=>m[1]);
scripts.forEach((s,i) => fs.writeFileSync('script_'+i+'.js', s));
