$(document).ready(async function () {
    try {
        // get all reports
        const fullResponse = await api.getReports();
        const reportsObject = fullResponse?.reports;
        const reportListArray = reportsObject?.reports;

        const $reportsList = $('.reports-list'); 
        $reportsList.empty().append('<li class="loading-message">Loading reports...</li>'); 

        if (Array.isArray(reportListArray) && reportListArray.length > 0) {
            $reportsList.empty();

            for (const report of reportListArray) {
                const reportId = report?.reportId;
                const contentType = report?.type || 'Unknown';
                const contentId = report?.idToReport || 'No id To Report';
                const reporterId = report?.reportedBy;
                const reportMessage = report?.userMessage || 'No message provided';

                let reporterUsername = "Unknown User";
                let reporterProfileImageUrl = "/Pictures/profile-default.webp";

            
                if (reporterId) {
                    try {
                        const profileResponse = await api.getUserProfileById(reporterId); //get user profile for users who reported a post/comment
                        const reporterProfile = profileResponse?.user;

                        if (reporterProfile) { 
                            reporterUsername = reporterProfile.username || reporterUsername; 
                            reporterProfileImageUrl = reporterProfile.profileImageUrl || reporterProfileImageUrl; 
                        } else {
                             console.warn(`Profile data missing in response for reporter: ${reporterId}`);
                        }
                    } catch (profileError) {
                        console.error(`Error fetching profile for reporter ${reporterId}:`, profileError);
                    }
                } else {
                     console.warn(`Report ${reportId} is missing reporterId.`);
                }

                let $reportListItem = $(`
                  <li class="report-list-item">
                    <a href="#" class="report-list-link" data-report-id="${reportId}" data-content-id="${contentId}" data-content-type="${contentType}" data-reporter-id="${reporterId || ''}">
                      <img src="${reporterProfileImageUrl}" alt="${reporterUsername}" class="reporter-pfp" />
                      <div class="info">
                        <div class="name">${reporterUsername}</div>
                        <div class="message-preview" title="${reportMessage}">${reportMessage.substring(0, 50) + (reportMessage.length > 50 ? '...' : '')}</div>
                      </div>
                    <!-- might add delete reports button like it is on the chats page -->
                    </a>
                  </li>
                `);
                //append report list the left panel
                $reportsList.append($reportListItem);
            } 
            AddReportClickHandler(); 
            reportHandler(); 
        } else {
            $reportsList.empty().html('<li>No reports found.</li>');
        }
    } catch (error) {
        $('.reports-list').empty().html('<li>Error loading reports.</li>');
    }
});

function AddReportClickHandler() {
    $('.reports-list').on('click', '.report-list-link', async function (event) {
        event.preventDefault();
        const $link = $(this);

        const reportId = $link.data('report-id');
        const contentId = $link.data('content-id');
        const contentType = $link.data('content-type');
        const reporterId = $link.data('reporter-id');
        const cleanReportId = String(reportId).trim();

        if (!reportId) return;
        $('.report-list-item').removeClass('active');
        $link.closest('li').addClass('active');

        const $reportChatArea = $('.report-area .report-chat');
        $('.report-area .default-view').removeClass('active');
        $reportChatArea.removeClass('active').html('<p class="loading-message">Loading report details...</p>').addClass('active');

        try {
            //fetch data needed for the right panel
            let reporterProfile = null;
            let reporterImg = null;
            if (reporterId) {
                const profileResponse = await api.getUserProfileById(reporterId);
                reporterProfile = profileResponse?.user;
                reporterImg = reporterProfile.profileImageUrl;
            }

            let contentDetails = null;
            let reportedUsername = null;
            let reportedUserImg = null;
            let postDate = null;
            if (contentId && contentType === 'post') {  
                const postResponse = await api.getPostById(contentId);
                console.log(JSON.stringify(postResponse));
                contentDetails = postResponse?.post || postResponse;
                const reportedUser = contentDetails.author;
                postDate = contentDetails?.postDate;
                const reported = await api.getUserProfileById(reportedUser);
                reportedUsername = reported.user.username;
                reportedUserImg = reported.user.profileImageUrl;
                // console.log(JSON.stringify(reported));
                

            } else if (contentId && contentType === 'comment') {
                //TODO api.getComment logic to be added
            }

            //populate right panel
            $reportChatArea.empty(); 

            // SSR the reported post header
             $reportChatArea.append(`
                <div class="report-header">
                  <button type="button" class="back-button"><i class="ri-arrow-left-line"></i></button>
                  <div class="user">
                    <img src="${reporterProfile?.profileImageUrl || '/Pictures/profile-default.webp'}" alt="${reporterProfile?.username || 'Unknown'}" />
                    <div class="name">${reporterProfile?.username || 'Unknown User'}</div>
                  </div>
                  <div class="actions">
                    <button type="button"><i class="ri-information-line"></i></button>
                  </div>
                </div>
             `);
            
             //SSR the report info (can remove just used for testing)
             $reportChatArea.append(`
                <div class="report-details">
                    <div class="report-box">
                    <img src="${reporterProfile?.profileImageUrl || '/Pictures/profile-default.webp'}" alt="${reporterProfile?.username || 'Unknown'}">
                    <h2 class="reported-content-title">${reporterProfile?.username} has Reported</h2>
                    <img src="${reportedUserImg || '/Pictures/profile-default.webp'}" alt="reported user image">
                    <h2 class="reported-content-title"> ${reportedUsername}'s ${contentType.toUpperCase()}</h2>
                    </div>
                </div>
                    <div class="reported-content-display">
                       <!-- appended reported posts will be displayed here -->
                    </div>
            
             `);

           
            const $contentDisplayArea = $reportChatArea.find('.reported-content-display');

            //gets the content from the reported post
            if (contentType === 'post' && contentDetails) {
                 $contentDisplayArea.html(`
                    <div class="post-container" id="postContainer">
                      <div class="post-head">
                        <img src="${reportedUserImg || '/Pictures/profile-default.webp'}" alt="reported user image">
                        <div class="post-head-details">
                            <p>${reportedUsername || 'N/A'}</p>
                            <span>${postDate}</span>
                        </div>
                    </div>
                    <hr>
                    <h3 class="post-title">${contentDetails.title || 'Post Title N/A'}</h3>
                    <p class="post-content">${contentDetails.content || 'Post content not available.'}</p>
                    ${contentDetails.imageUrl ? `<img src="${contentDetails.imageUrl}" alt="Post Image" class="post-image">` : ''}
                    </div>
                    <div class="btn-container">
                        <button class="report-action-btn dismiss-btn" data-report-id="${cleanReportId}" data-action="dismiss">Dismiss Report</button>
                        <button class="report-action-btn delete-btn" data-report-id="${cleanReportId}" data-action="delete">Delete Report</button>
                        <button class="report-action-btn warn-btn" data-report-id="${cleanReportId}" data-action="warn">Warn User</button>
                        <button class="report-action-btn ban-btn" data-report-id="${cleanReportId}" data-action="ban">Ban User</button>
                    </div>
                 `);
                 //gets the content from the reported comment
            } else if (contentType === 'comment' && contentDetails) { 
                 //TODO SSR for when comment reports are implemented
            } else if (contentId) {
                $contentDisplayArea.html(`<p>Could not load details for ${contentType} with ID ${contentId}.</p>`);
            } else {
                 $contentDisplayArea.html(`<p>No content ID associated with this report.</p>`);
            }


        } catch (error) {
            $reportChatArea.html(`
                <p class="error-message">Failed to load report details. Please try again.</p>
                <button class="report-action-btn dismiss-btn" data-report-id="${cleanReportId}" data-action="dismiss">Dismiss Report</button>
                <button class="report-action-btn delete-btn" data-report-id="${cleanReportId}" data-action="delete">Delete Report</button>
                <button class="report-action-btn warn-btn" data-report-id="${cleanReportId}" data-action="warn">Warn User</button>
                <button class="report-action-btn ban-btn" data-report-id="${cleanReportId}" data-action="ban">Ban User</button>
                `).addClass('active');
        }
    });
}
//function for handling report actions
function reportHandler() {

    const $reportArea = $('.report-area');

    $reportArea.on('click','.report-action-btn', function(e) {
        e.preventDefault();
        const $btn = $(this);
        const reportId = $btn.data('report-id');
        const cleanReportId = String(reportId).trim();
        const action = $btn.data('action')
        

        if(!reportId || !action){
            console.error("reportId or action is missing", $btn);
            return
        }

        if(window.api && typeof window.api.processReport === 'function'){
            window.api.processReport(cleanReportId, action)
                .then(() => {
                    const listItemSelector = `.report-list-item .report-list-link[data-report-id="${cleanReportId}"]`;
                    const $listItemLink = $(listItemSelector);
                        $listItemLink.closest('li').remove();
                    $('.report-area .report-chat').empty().removeClass('active');
                    $('.report-area .default-view').addClass('active');
                })
                .catch(error => {
                    console.error(`DEBUG: API Error processing action '${action}' for report ${cleanReportId}:`, error);
                    alert(`Failed to perform action '${action}' on report ${cleanReportId}. Please check console and try again.`);
                });     
        }
    })
}