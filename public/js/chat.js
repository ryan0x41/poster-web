// jQuery is the shit

$(document).ready(async function () {
  await api.startSocketConnection(443, renderMessage);
  // we need the current userId to check if we are the reciever of a message
  let currentUser = window.getUserCookieProperty ? window.getUserCookieProperty('id') : null;
  // we also need to render our own profile image
  let myProfileImage = window.getUserCookieProperty ? (window.getUserCookieProperty('profileImageUrl') || '/Pictures/profile-default.webp') : '/Pictures/profile-default.webp';

  // clear conversation list and chats (placeholder)
  $('.conversation-list').empty();
  $('.chat-area .conversation-chat').remove();

  // call our api to grab the current conversations we are in
  let { conversations } = await api.getConversations();

  // for each conversation
  for (const conv of conversations) {
    // grab the other users profile information
    let otherUserId = conv.participants.find(id => id !== currentUser);
    const { user } = await api.getUserProfileById(otherUserId);

    // assign that to otherUserProfile we will use this to access sender account information
    let otherUserProfile = user;
    // might need this
    let convContainerId = 'conversation-' + conv.conversationId;
    // default profile image if they dont have one
    let otherProfileImage = otherUserProfile.profileImageUrl || '/Pictures/profile-default.webp';

    // render conversation box
    let $convItem = $(`
      <li>
        <a href="#" data-conversation="#${convContainerId}" data-conversation-id="${conv.conversationId}" data-other-username="${otherUserProfile.username}" data-other-profile-image="${otherProfileImage}">
          <img src="${otherProfileImage}" alt="${otherUserProfile.username}" />
          <div class="info">
            <div class="name">${otherUserProfile.username}</div>
          </div>
        </a>
      </li>
    `);
    $('.conversation-list').append($convItem);

    // render chat container
    let $chatContainer = $(`
      <div class="conversation-chat" id="${convContainerId}" data-conversation-id="${conv.conversationId}" data-other-user-id="${otherUserId}" data-other-username="${otherUserProfile.username}" data-other-profile-image="${otherProfileImage}">
        <div class="chat-header">
          <button type="button" class="back-button">
            <i class="ri-arrow-left-line"></i>
          </button>
          <div class="user">
            <img src="${otherProfileImage}" alt="${otherUserProfile.username}" />
            <div class="name">${otherUserProfile.username}</div>
          </div>
          <div class="actions">
            <button type="button">
              <i class="ri-information-line"></i>
            </button>
          </div>
        </div>
        <div class="messages"></div>
        <form class="chat-form">
          <textarea placeholder="Type your message here..."></textarea>
          <button type="submit">
            <i class="ri-send-plane-line"></i>
          </button>
        </form>
      </div>
    `);
    $('.chat-area').append($chatContainer);
  }

  function renderMessage(msg) {
    let messageHtml = '';
    const $messagesContainer = $('.conversation-chat.active .messages');

    // if the message sender is us, we are the "reciever", (purple message on right)
    // TODO: rename things
    if (msg.sender === currentUser) {
      messageHtml = `
          <div class="message-group">
            <div class="message-container receiver">
              <div class="message-content">
                <p>${msg.content}</p>
                <div class="message-time">${new Date(msg.sendAt).toLocaleTimeString()}</div>
              </div>
              <img class="message-profile" src="${myProfileImage}" alt="Receiver Profile" />
            </div>
          </div>
        `;
      // or else render message as sender, grey and on left hand side
    } else {
      const otherProfileImage = $('.conversation-chat.active').data('other-profile-image') || '/Pictures/profile-default.webp';
      messageHtml = `
          <div class="message-group">
            <div class="message-container sender">
              <img class="message-profile" src="${otherProfileImage}" alt="Sender Profile" />
              <div class="message-content">
                <p>${msg.content}</p>
                <div class="message-time">${new Date(msg.sendAt).toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        `;
    }
    $messagesContainer.append(messageHtml);
    $messagesContainer.scrollTop($messagesContainer.prop("scrollHeight"));
  }

  // when a conversation is clicked
  $('[data-conversation]').on('click', async function (event) {
    event.preventDefault();

    // grab a reference to the conversation container element and get our conversationId
    let convContainerSelector = $(this).data('conversation');
    let conversationId = $(this).data('conversation-id');
    let $convEl = $(convContainerSelector);

    // remove the placeholder shown at page load and display our conversation
    $('.default-view').removeClass('active');
    $('.conversation-chat').removeClass('active');
    $('[data-conversation]').parent().removeClass('active');
    $(this).parent().addClass('active');

    // css for mobile devices, which will not show sidebar and conversation at the same time
    if ($(window).width() <= 768) {
      $('.chat-container').addClass('mobile-chat-active');
    }

    $convEl.addClass('active');

    // make a call to api to grab message thread for a conversation
    let { messages } = await api.getMessageThread(conversationId);
    messages.sort((a, b) => new Date(a.sendAt) - new Date(b.sendAt));
    // remove placeholder messages 
    // TODO: dont even display these in the first place
    let $messagesContainer = $convEl.find('.messages');
    $messagesContainer.empty();

    // to prevent multiple calls to api
    let otherProfileImage = $convEl.data('other-profile-image');

    // for each message
    messages.forEach(function (msg) {
      renderMessage(msg);
    });

    $messagesContainer.scrollTop($messagesContainer.prop("scrollHeight"));
  });

  // click handler for the back button
  $('.chat-area').on('click', '.back-button', function (event) {
    event.preventDefault();
    // remove conversation container from view
    $('.conversation-chat').removeClass('active');
    // add back select chat placeholder
    $('.default-view').addClass('active');
    // render sidebar as the full view on mobile
    if ($(window).width() <= 768) {
      $('.chat-container').removeClass('mobile-chat-active');
    }
  });

  // click handler for send button
  $('.chat-area').on('submit', '.chat-form', function (event) {
    event.preventDefault();
    // grab the text area and content it contains, dont do anything if theres no content
    var $textarea = $(this).find('textarea');
    var content = $textarea.val().trim();
    if (content === "") return;

    // grab the conversationId for current conversation
    var $chatContainer = $(this).closest('.conversation-chat');
    var conversationId = $chatContainer.data('conversation-id');

    // use the api to send a message with content using the conversationId
    api.sendMessage(conversationId, content)
      .then(function (res) {
        // on success we remove what ever is in the text field
        $textarea.val('');
        // then we find the messages container and render our sent message to it
        let $messagesContainer = $chatContainer.find('.messages');
        let newMessageHtml = `
          <div class="message-group">
            <div class="message-container receiver">
              <div class="message-content">
                <p>${content}</p>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
              </div>
              <img class="message-profile" src="${myProfileImage}" alt="Receiver Profile" />
            </div>
          </div>
        `;
        $messagesContainer.append(newMessageHtml);
        $messagesContainer.scrollTop($messagesContainer.prop("scrollHeight"));
      })
      .catch(function (err) {
        console.error('failed to send message', err);
      });
  });
});