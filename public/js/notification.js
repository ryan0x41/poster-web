var notifSound = new Audio('/sounds/notif.mp3');
var notifSoundEnabled = false;

// update nav badge
function updateNotificationsBadge() {
    var unreadCount = $('#notifications-list li').length;
    var badge = $('#notifications-badge');
    badge.text(unreadCount);
    badge.css('display', unreadCount > 0 ? 'inline-flex' : 'none');
}

// render notification to nav
function addNotification(notification) {
    // play notification sound
    if (notifSoundEnabled) {
        notifSound.currentTime = 0;
        notifSound.play();
    }

    var message = notification.notificationMessage;
    var notificationId = notification.notificationId;
    var senderId = notification.sender;
    var iconHTML = '';

    if (notification.notificationType === 'message') {
        iconHTML = '<i class="fas fa-envelope mr-2" style="color: var(--light);"></i>';
    } else if (notification.notificationType === 'follow') {
        iconHTML = '<i class="fas fa-user mr-2" style="color: var(--light);"></i>';
    }

    var li = $(`<li notification-id="${notificationId}" class="flex items-center justify-between py-1 cursor-pointer">` +
        iconHTML +
        '<span class="text-[var(--light)] text-sm">' + message + '</span></li>');

    li.on('click', async function () {
        await readNotification(notificationId);
        if (notification.notificationType === 'message') {
            window.location.href = '/start/chat/' + senderId;
        } else if (notification.notificationType === 'follow') {
            window.location.href = '/profile/id/' + senderId;
        }
    });

    $('#notifications-list').append(li);
    updateNotificationsBadge();
}

// retrieve all notifications and render each one
async function getAllNotifications() {
    const { notifications } = await api.getNotifications();

    // render each notification
    notifications.forEach(notification => {
        addNotification(notification);
    });

    return notifications;
}

// read notification
async function readNotification(notificationId) {
    try {
        await api.readNotification(notificationId);

        // remove notif from list
        $(`[notification-id="${notificationId}"]`).remove();
        updateNotificationsBadge();
    } catch (error) {
        console.error('err marking notification as read:', error);
    }
}

// read all notifications and clear notifications list on success
async function readAllNotifications() {
    try {
        await api.readAllNotification();

        // clear ui, man jQuery is great
        $('#notifications-list').empty();
        updateNotificationsBadge();
    } catch (error) {
        console.error('err marking all notifications as read:', error);
    }
}

$(document).ready(async function () {
    api.notificationWsConnection(window.wsPortNumber, addNotification);

    // on document load retrieve saved unread notifications
    await getAllNotifications();

    $('#read-all-button').on('click', async function () {
        await readAllNotifications();
    });

    $(document).one('click', function () {
        notifSoundEnabled = true;
    });
});