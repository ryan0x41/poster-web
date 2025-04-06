$(document).ready(async function () {

    // $('.reports-list').empty();
    // $('report-area .report-chat').remove();

    const { reports } = await api.getReports();

    console.log(JSON.stringify(reports));
    
    
    
});