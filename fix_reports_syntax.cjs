const fs = require('fs');
const path = 'dashboard/operations/reports.html';
let content = fs.readFileSync(path, 'utf8');

// I will manually fix the corrupted bottom part of reports.html
const startCorrupted = content.indexOf('        const aRevVal = typeof aRev !== \'undefined\' ? aRev : 1800; // Total ancillary');
if(startCorrupted !== -1) {
    content = content.substring(0, startCorrupted);
}

const correctEnding = `        const aRevVal = typeof aRev !== 'undefined' ? aRev : 1800; // Total ancillary
        
        createProgressBars('ancillaryMix', [
            { label: '골프장 (Golf)', sub: '$' + Math.round(aRevVal * 0.47).toLocaleString(), pct: 47 },
            { label: '렌터카 (Rent-a-car)', sub: '$' + Math.round(aRevVal * 0.30).toLocaleString(), pct: 30 },
            { label: '룸서비스 (Room Service)', sub: '$' + Math.round(aRevVal * 0.23).toLocaleString(), pct: 23 }
        ], 'var(--purple)');

        const rRevVal = typeof rRev !== 'undefined' ? rRev : 19100;
        createProgressBars('channelMix', [
            { label: 'OTA (Agoda/Booking)', sub: '$' + Math.round(rRevVal * 0.48).toLocaleString(), pct: 48 },
            { label: '자체 웹사이트 (Website)', sub: '$' + Math.round(rRevVal * 0.35).toLocaleString(), pct: 35 },
            { label: '다이렉트 (Direct)', sub: '$' + Math.round(rRevVal * 0.17).toLocaleString(), pct: 17 }
        ], 'var(--blue)');

        const tRevVal = typeof tRev !== 'undefined' ? tRev : 23350;
        createProgressBars('paymentMix', [
            { label: '신용카드 (Credit Card)', sub: '$' + Math.round(tRevVal * 0.82).toLocaleString(), pct: 82 },
            { label: '계좌이체 (Bank Transfer)', sub: '$' + Math.round(tRevVal * 0.12).toLocaleString(), pct: 12 },
            { label: '현금 (Cash)', sub: '$' + Math.round(tRevVal * 0.06).toLocaleString(), pct: 6 }
        ], 'var(--success)');

    } catch(e) {
        console.error(e);
        alert('리포트 데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadReportData();
});
</script>
<script>
// Sync language selector to stored preference
(function(){
    var sel = document.getElementById('langSelect');
    if(sel) sel.value = localStorage.getItem('pms_lang') || 'ko';
})();
</script>
</body>
</html>`;

fs.writeFileSync(path, content + correctEnding);
console.log("Fixed corrupted reports.html syntax");
