document.querySelectorAll('.toggle-comments').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const postContainer = this.closest('.post-container');
    const commentsSection = postContainer.nextElementSibling;
    if (commentsSection && commentsSection.classList.contains('comments-section')) {
      commentsSection.classList.toggle('open');
      postContainer.style.marginBottom = commentsSection.classList.contains('open') ? "0" : "0em";
    }
  });
});

document.querySelectorAll('.like-post').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();

    const postContainer = this.closest('.post-container');
    const postId = postContainer.getAttribute('post-id');

    const countSpan = this.querySelector('.post-like-count');
    let count = parseInt(countSpan.textContent, 10);

    if (this.classList.contains('liked')) {
      count--;
      this.classList.remove('liked');
    } else {
      count++;
      this.classList.add('liked');
    }

    countSpan.textContent = count;

    if (window.api && typeof window.api.likePost === 'function') {
      window.api.likePost(postId);
    } else {
      console.error("api.likePost is not defined");
    }
  });
});

function addCommentLikeHandler(btn) {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const countSpan = this.querySelector('.comment-like-count');
    let count = parseInt(countSpan.textContent, 10);
    if (this.classList.contains('liked')) {
      count--;
      this.classList.remove('liked');
    } else {
      count++;
      this.classList.add('liked');
    }
    countSpan.textContent = count;
  });
}
document.querySelectorAll('.like-comment').forEach(btn => {
  addCommentLikeHandler(btn);
});

document.querySelectorAll('.submit-comment').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const commentForm = this.closest('.comment-form');
    const textarea = commentForm.querySelector('textarea');
    const commentText = textarea.value.trim();
    if (!commentText) return;
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.innerHTML = `
    <div class="user-profile">
        <img src="/Pictures/images/profile.png" alt="Profile Image">
        <div>
        <p>Guest</p>
        <span class="comment-date">${new Date().toLocaleString()}</span>
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
    const commentsList = this.closest('.comments-section').querySelector('.comments-list');
    commentsList.appendChild(newComment);
    textarea.value = "";
    addCommentLikeHandler(newComment.querySelector('.like-comment'));
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
      console.error("userId to follow not found");
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
