document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.post-col').addEventListener('click', (e) => {
    let toggleBtn = e.target.closest('.toggle-comments');
    if (toggleBtn) {
      e.preventDefault();
      const postContainer = toggleBtn.closest('.post-container');
      const commentsSection = postContainer.nextElementSibling;
      if (commentsSection && commentsSection.classList.contains('comments-section')) {
        commentsSection.classList.toggle('open');
        postContainer.style.marginBottom = commentsSection.classList.contains('open') ? "0" : "0em";
      }
    }
    let likeBtn = e.target.closest('.like-post');
    if (likeBtn) {
      e.preventDefault();
      const postContainer = likeBtn.closest('.post-container');
      const postId = postContainer.getAttribute('post-id');
      const countSpan = likeBtn.querySelector('.post-like-count');
      let count = parseInt(countSpan.textContent, 10);
      if (likeBtn.classList.contains('liked')) {
        count--;
        likeBtn.classList.remove('liked');
      } else {
        count++;
        likeBtn.classList.add('liked');
      }
      countSpan.textContent = count;
      if (window.api && typeof window.api.likePost === 'function') {
        window.api.likePost(postId);
      } else {
        console.error("api.likePost is not defined");
      }
    }
  });
  document.querySelectorAll('.post-container').forEach(postContainer => {
    const postId = postContainer.getAttribute('post-id');
    const commentsSection = postContainer.nextElementSibling;
    const commentsList = commentsSection.querySelector('.comments-list');
    commentsList.innerHTML = '';
    if (window.api && typeof window.api.getCommentsByPost === 'function') {
      window.api.getCommentsByPost(postId)
        .then(data => {
          data.comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            const username = window.getUserCookieProperty('username');
            const isOwner = username == comment.author;
            const commentId = comment.commentId;
            // const id = api.getComment(commentId);
            // console.log(JSON.stringify(id));
            let actionHTML = '';

            if(isOwner){
              actionHTML = `<div class="delete-comment-btn" data-comment-id="${commentId}" title="Delete Comment">✕</div>`;
                    } else {
                        actionHTML = `
                            <div class="more-opt-wrapper">
                              <div class="more-opt-btn" title="More options">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                              <div class="report-dropdown">
                                <a class="report-btn" href="#" data-content-id="${commentId}" data-content-type="comment">Report</a>
                              </div>
                            </div>
                          `;
                    }

            commentDiv.className = 'comment';
            commentDiv.setAttribute('data-comment-id', commentId);
            commentDiv.innerHTML = `
              <div class="user-profile">
                <img src="${comment.profileImageUrl || '/Pictures/profile-default.webp'}" alt="profile image">
                <div class="comment-actions">
                <p>${comment.author}</p>
                <div>${actionHTML}</div> 
                </div>
              </div>
              <p class="comment-text">${comment.content}</p>
            `;
            commentsList.appendChild(commentDiv);
          });
        })
        .catch(error => {
          console.error("error fetching comments for post", postId, error);
        });
    }
  });
  document.querySelectorAll('.submit-comment').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const commentForm = this.closest('.comment-form');
      const textarea = commentForm.querySelector('textarea');
      const commentText = textarea.value.trim();
      if (!commentText) return;
      const commentsSection = this.closest('.comments-section');
      const postContainer = commentsSection.previousElementSibling;
      if (!postContainer) {
        console.error("Post container not found");
        return;
      }
      const postId = postContainer.getAttribute('post-id');
      if (window.api && typeof window.api.addCommentToPost === 'function') {
        window.api.addCommentToPost({ postId, content: commentText })
          .then(response => {
            const newCommentData = response.comment;
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            const userProfileImageUrl = window.getUserCookieProperty('profileImageUrl');
            const username = window.getUserCookieProperty('username');
            newComment.innerHTML = `
              <div class="user-profile">
                <img src="${userProfileImageUrl || '/pictures/profile-default.webp/'}" alt="profile image">
                <div>
                  <p>${username || "undefined"}</p>
                </div>
              </div>
              <p class="comment-text">${commentText}</p>
            `;
            const commentsList = commentsSection.querySelector('.comments-list');
            commentsList.appendChild(newComment);
            textarea.value = "";
          })
          .catch(error => {
            console.error("error adding comment:", error);
            alert("error adding comment");
          });
      } else {
        console.error("api.addCommentToPost is not defined");
      }
    });
  });
  function openImageModal(imgElement) {
    const modal = document.getElementById("imageModal");
    const fullImage = document.getElementById("fullImage");
    fullImage.src = imgElement.src;
    modal.style.display = "flex";
  }
  function closeImageModal() {
    document.getElementById("imageModal").style.display = "none";
  }
  document.querySelectorAll('.submit-post').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const titleTextarea = document.querySelector('.post-title-textarea');
      const contentTextarea = document.querySelector('.post-content-textarea');
      const title = titleTextarea ? titleTextarea.value.trim() : '';
      const content = contentTextarea ? contentTextarea.value.trim() : '';
      if (!title || !content) {
        alert('please enter both title and content');
        return;
      }
      const postData = { title, content, images: [] };
      if (window.api && typeof window.api.createPost === 'function') {
        window.api.createPost(postData)
          .then(res => {
            window.location.reload();
          })
          .catch(err => {
            console.error("error creating post:", err);
            alert("error creating post");
          });
      } else {
        console.error("api.createPost is not defined");
      }
    });
  });
  const followBtn = document.getElementById('follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const icon = this.querySelector('i');
      const profileCard = document.querySelector('.profile-card');
      const userIdToFollow = profileCard ? profileCard.getAttribute('profile-id') : null;
      if (!userIdToFollow) {
        console.error("UserId to follow not found");
        return;
      }
      if (window.api && typeof window.api.followUser === 'function') {
        window.api.followUser(userIdToFollow)
          .then(response => {
            if (this.classList.contains('followed')) {
              this.classList.remove('followed');
              icon.classList.remove('fa-user-check');
              icon.classList.add('fa-user-plus');
            } else {
              this.classList.add('followed');
              icon.classList.remove('fa-user-plus');
              icon.classList.add('fa-user-check');
            }
          })
          .catch(error => {
            console.error("error toggling follow", error);
          });
      } else {
        console.error("api.followUser is not defined");
      }
    });
  }

  document.querySelectorAll('.more-opt-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      const menu = this.nextElementSibling;
      const isOpen = menu.style.display === 'block';

      document.querySelectorAll('.report-dropdown').forEach(m => m.style.display = 'none');
      if (!isOpen) {
        menu.style.display = 'block';
      }
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.report-dropdown').forEach(menu => {
      menu.style.display = 'none';
    });
  });

  const reportModal = document.getElementById('reportModal');
  const cancelReportBtn = reportModal.querySelector('.cancel-report-btn');
  document.querySelectorAll('.report-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      const postContainer = this.closest('.post-container');
      const postId = postContainer?.getAttribute('post-id');

      if (!postId) {
        console.warn('No post-id found on report button.');
        return;
      }

      reportModal.setAttribute('data-post-id', postId);
      reportModal.style.display = 'flex';
    });
  });

  cancelReportBtn.addEventListener('click', () => {
    reportModal.style.display = 'none';
  });

  window.addEventListener('click', function (e) {
    if (e.target === reportModal) {
      reportModal.style.display = 'none';
    }
  });

  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = deleteModal.querySelector('.confirm-delete-btn');
  const cancelDeleteBtn = deleteModal.querySelector('.cancel-delete-btn');
  document.querySelectorAll('.delete-post-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      postToDelete = this.closest('.post-container');
      const postId = postToDelete?.getAttribute('post-id');

      if (!postId) {
        console.error('cannot find postId attr');
        return;
      }

      deleteModal.setAttribute('data-post-id', postId);
      deleteModal.style.display = 'flex';
    });
  });

  cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.removeAttribute('data-post-id', postId);
    deleteModal.style.display = 'none';
  });

  confirmDeleteBtn.addEventListener('click', () => {
    const postId = deleteModal.getAttribute('data-post-id');
    if (!postId) {
      console.error("no post id found");
      return;
    }

    if (window.api && typeof window.api.deletePost === 'function') {
      window.api.deletePost(postId)
        .then(() => {
          if (postToDelete) {
            postToDelete.style.display = 'none';
          }
          deleteModal.style.display = 'none';
        })
        .catch(err => {
          console.error("error deleting post:", err);
          alert("error deleting post");
          deleteModal.style.display = 'none';
          // window.location.reload();
        });
    } else {
      console.error("api.deletePost is not defined");
    }
  });

  window.addEventListener('click', function (e) {
    if (e.target === deleteModal) {
      deleteModal.style.display = 'none';
    }
  });

  document.querySelectorAll('.confirm-report-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const reportTextArea = document.querySelector('.report-msg-textarea');
      const msg = reportTextArea ? reportTextArea.value.trim() : '';
      if (!msg) {
        alert('Please enter a reason for this report');
        return;
      } else if (msg.length > 100 ){
        alert('Reason Must Be Less Than 100 Characters');
        return;
      }
      const type = 'post';
      const modal = document.getElementById('reportModal');
      const idToReport = modal.getAttribute('data-post-id');

      if (!idToReport) {
        alert("could no find post id to report");
        console.log("no post id found");
      }

      const reportData = { type, idToReport, userMessage: msg };
      if (window.api && typeof window.api.createReport === 'function') {
        window.api.createReport(reportData)
          .then(res => {
            window.location.reload();
          })
          .catch(err => {
            console.error("error creating report: ", err);
            alert("error creating report");
          });
      } else {
        console.error("api.createReport is not defined");
      }
    });
  });

});

// document.addEventListener('DOMContentLoaded', function (){
// function reportDropdown(button){
//   const menu = button.nextElementSibling;
//   menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
// }

// dicument.addEventLister('click', function(e){
//   const reportMenu = document.querySelectorAll('.report-dropdown');
//   e.stopPropagation();
//   reportMenu.forEach(menu => {
//     if(!menu.parentElement.contains(e.target)) {
//       menu.style.display = 'none';
//     }
//   })
// });
// });