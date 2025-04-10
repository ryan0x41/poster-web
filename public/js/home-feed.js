// client side rendering for the feed page

function removeSkeletons() {
  // placeholder skeletons before api response
  const skeletons = document.querySelectorAll('.post-skeleton, .user-skeleton');
  skeletons.forEach(el => el.remove());
}

// for a given post
function addNewPost(post) {
  // remove all the skeletons
  removeSkeletons();
  // grab user information from the user cookie, we are looking for the user id
  let currentUser = window.getUserCookieProperty ? window.getUserCookieProperty('id') : null;
  // we check if the user has already liked the post, if so we make sure the liked class is along with the like-post class
  let isLiked = post.likedBy && currentUser ? post.likedBy.includes(currentUser) : false;
  // pain, extract all post information and render it into html
  const postHTML = `
      <div post-id="${post.postId}" class="post-container">
        <div class="user-profile" onclick="window.location='/profile/${post.userProfile.username}'" style="cursor:pointer;">
          <img src="${post.userProfile.profileImageUrl || '/Pictures/profile-default.webp'}" alt="Profile Image">
          <div>
          <div class="user-header">
            <p>${post.userProfile.username}</p>
            <div class="more-opt-wrapper" onclick="reportDropdown(this)">
            <div class="more-opt-btn">
                  <span></span>
                  <span></span>
                  <span></span>
            </div>
              <div class="report-dropdown">
                <a class="report-btn">Report</a>
              </div>
              </div>
            </div>
            <span class="post-date">${post.postDate}</span>
          </div>
        </div>
        <hr>
        ${post.title ? `<h3 class="post-title">${post.title}</h3>` : ''}
        <p class="post-text">${post.content.replace(/[\u00A0-\u9999<>\&]/g, i => '&#' + i.charCodeAt(0) + ';')}</p>
        <hr>
        ${post.images && post.images.length !== 0 ? `<img src="${post.images[0]}" class="post-img preview-img" alt="Feed Image" onclick="openImageModal(this)">` : ''}
        <div class="post-row">
          <div class="activity-icons">
            <a href="#" class="like-post ${isLiked ? 'liked' : ''}">
              <i class="fas fa-thumbs-up"></i>
              <span class="post-like-count">${post.likes}</span>
            </a>
            <a href="#" class="toggle-comments">
              <i class="fas fa-comment"></i>
            </a>
          </div>
        </div>
      </div>
      <div class="comments-section">
        <div class="comment-form">
          <hr>
          <textarea rows="2" placeholder="Write a comment..."></textarea>
          <button class="submit-comment">Post Comment</button>
        </div>
        <div class="comments-list">
          <div class="comment">
            <hr>
            <div class="user-profile">
              <img src="/Pictures/profile-default.webp" alt="Profile Image">
              <div>
                <p>Guest</p>
                <span class="comment-date">Now</span>
              </div>
            </div>
            <p class="comment-text">This is a placeholder comment.</p>
            <div class="comment-actions">
              <a href="#" class="like-comment">
                <i class="fas fa-thumbs-up"></i>
                <span class="comment-like-count">0</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  const postCol = document.querySelector('.post-col');
  postCol.insertAdjacentHTML('afterbegin', postHTML);
}

// for given new user information, render
function addNewUser(user) {
  // remove skeletons
  removeSkeletons();
  const userHTML = `
      <div onclick="window.location='/profile/${user.username}'" style="cursor:pointer;" class="user-profile">
        <img src="${user.profileImageUrl || '/Pictures/profile-default.webp'}" alt="Profile Image">
        <div>
          <p>${user.username}</p>
        </div>
      </div>
    `;
  const newUsersContainer = document.querySelector('.new-users');
  newUsersContainer.insertAdjacentHTML('afterbegin', userHTML);
}

// load the home feed will call the api for the home feed, and for each post we render it to  page
async function loadHomeFeed() {
  try {
    const homeFeedResponse = await api.getHomeFeed();
    homeFeedResponse.posts.forEach(post => {
      addNewPost(post);
    });
  } catch (error) {
    console.error("error loading home feed:", error);
  }
}

// load new users, request new users from api, then for each user render it to the sidebar
async function loadNewUsers() {
  try {
    const newUsersResponse = await api.getNewUsers();
    newUsersResponse.users.forEach(user => {
      addNewUser(user);
    });
  } catch (error) {
    console.error("error loading new users:", error);
  }
}

// load all comments for each post
function loadAllComments() {
  document.querySelectorAll('.post-container').forEach(postContainer => {
    // to retrieve comments for a post we need to extact postId from the post-id attribute
    const postId = postContainer.getAttribute('post-id');
    const commentsSection = postContainer.nextElementSibling;
    const commentsList = commentsSection.querySelector('.comments-list');

    // this has caused errors before so a quick check to make sure we have the getCommentsByPost function globally assigned to window
    // this should of been set by views/header.ejs js
    if (window.api && typeof window.api.getCommentsByPost === 'function') {
      window.api.getCommentsByPost(postId)
        .then(data => {
          // remove placeholder comments
          commentsList.innerHTML = '';

          // for each comment
          data.comments.forEach(comment => {
            // create a comment element
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            // render html
            commentDiv.innerHTML = `
                          <div class="user-profile">
                            <img src="${comment.profileImageUrl || '/Pictures/profile-default.webp'}" alt="profile image">
                            <div>
                              <p>${comment.author}</p>
                            </div>
                          </div>
                          <p class="comment-text">${comment.content}</p>
                        `;
            // append to comments list class
            commentsList.appendChild(commentDiv);
          });
        })
        .catch(error => {
          console.error("error fetching comments for post", postId, error);
        });
    }
  });
}

// this will be called once our page is ready
document.addEventListener("DOMContentLoaded", async () => {
  // load the home feed first
  await loadHomeFeed();
  // then new users
  await loadNewUsers();
  // then comments for each post
  // we shouldnt have to await here since by the time users click comments section they already should be rendered
  loadAllComments();
  // add submit comment functionality
  document.querySelectorAll('.submit-comment').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      // grab comment information
      const commentForm = this.closest('.comment-form');
      // from the text area
      const textarea = commentForm.querySelector('textarea');
      // and remove whitespace
      const commentText = textarea.value.trim();
      // if the user has not enetered anything, dont do anything
      if (!commentText) return;
      // grab a reference to comments section class
      const commentsSection = this.closest('.comments-section');
      // the post container is the previous sibling
      const postContainer = commentsSection.previousElementSibling;
      // to add a comment we need the post id, so if theres no post, throw an err, dont continue
      if (!postContainer) {
        console.error("post container not found");
        return;
      }
      // grab post id from attribute
      const postId = postContainer.getAttribute('post-id');
      // make sure we have the addCommentToPost ability assigned to window globally
      if (window.api && typeof window.api.addCommentToPost === 'function') {
        // call the function with data
        window.api.addCommentToPost({ postId, content: commentText })
          // after response
          .then(response => {
            // render the comment, we dont want to render if there was a 500 failure
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            // if we are the ones commenting our profileImageUrl is within our user cookie
            const userProfileImageUrl = window.getUserCookieProperty('profileImageUrl');
            // same with username
            const username = window.getUserCookieProperty('username');
            // render
            newComment.innerHTML = `
                          <div class="user-profile">
                            <img src="${userProfileImageUrl || '/Pictures/profile-default.webp'}" alt="profile image">
                            <div>
                              <p>${username || "undefined"}</p>
                            </div>
                          </div>
                          <p class="comment-text">${commentText}</p>
                          <div class="comment-actions">
                            <a href="#" class="like-comment">
                              <i class="fas fa-thumbs-up"></i>
                              <span class="comment-like-count">0</span>
                            </a>
                          </div>
                        `;
            // assign to comments list
            const commentsList = commentsSection.querySelector('.comments-list');
            commentsList.appendChild(newComment);
            // remove any leftovers
            textarea.value = "";
          })
          .catch(error => {
            // notify if there was an error
            console.error("error adding comment:", error);
            alert("error adding comment");
          });
      } else {
        console.error("api.addCommentToPost is not defined");
      }
    });
  });
});

// raw js client side rendering is painful, TODO: jQuery or something else in future
// ~200 lines for this is not worth it