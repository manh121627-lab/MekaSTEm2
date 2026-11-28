const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');

if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });
}

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const formData = Object.fromEntries(new FormData(contactForm).entries());
        formData._subject = 'Đăng ký tư vấn mới từ website MekaSTEM';
        formData._replyto = formData.email;
        formData._template = 'table';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
        }
        if (formStatus) {
            formStatus.textContent = 'Đang gửi thông tin...';
        }

        fetch('https://formsubmit.co/ajax/mekastem@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok || !(result.success === true || result.success === 'true')) {
                    throw new Error(result.message || 'Không thể gửi thông tin lúc này.');
                }
                return result;
            })
            .then(() => {
                contactForm.reset();
                if (formStatus) {
                    formStatus.textContent = 'Gửi thông tin thành công. MekaSTEM sẽ liên hệ với bạn sớm.';
                }
            })
            .catch(() => {
                if (formStatus) {
                    formStatus.textContent = 'Chưa gửi được thông tin. Vui lòng thử lại hoặc liên hệ qua mekastem@gmail.com.';
                }
            })
            .finally(() => {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.removeAttribute('aria-busy');
                }
            });
    });
}

const chatbot = (() => {
    const widget = document.createElement('section');
    widget.className = 'chat-widget';
    widget.setAttribute('aria-label', 'Chatbot tư vấn MekaSTEM');
    widget.innerHTML = `
        <section class="chat-panel" id="chatPanel" aria-label="Trò chuyện với MekaSTEM" hidden>
            <header class="chat-header">
                <span class="chat-avatar" aria-hidden="true"><i class="fa-solid fa-graduation-cap"></i></span>
                <div class="chat-heading">
                    <strong>MekaSTEM tư vấn</strong>
                    <span><span class="chat-status-dot"></span> Sẵn sàng hỗ trợ</span>
                </div>
                <button class="chat-close" type="button" aria-label="Đóng tư vấn"><i class="fa-solid fa-xmark"></i></button>
            </header>
            <div class="chat-messages" id="chatMessages" role="log" aria-live="polite" aria-relevant="additions"></div>
            <div class="chat-suggestions" id="chatSuggestions" aria-label="Câu hỏi gợi ý"></div>
            <form class="chat-form" id="chatForm">
                <label class="sr-only" for="chatInput">Nhập câu hỏi của bạn</label>
                <input id="chatInput" name="message" type="text" maxlength="500" placeholder="Nhập câu hỏi của bạn..." autocomplete="off" required>
                <button type="submit" aria-label="Gửi tin nhắn"><i class="fa-solid fa-paper-plane"></i></button>
            </form>
            <p class="chat-disclaimer">Trợ lý tự động dựa trên thông tin MekaSTEM.</p>
        </section>
        <button class="chat-launcher" type="button" aria-expanded="false" aria-controls="chatPanel">
            <i class="fa-regular fa-comment-dots" aria-hidden="true"></i>
            <span>Tư vấn ngay</span>
        </button>`;
    document.body.appendChild(widget);

    const panel = widget.querySelector('#chatPanel');
    const launcher = widget.querySelector('.chat-launcher');
    const closeButton = widget.querySelector('.chat-close');
    const messages = widget.querySelector('#chatMessages');
    const suggestions = widget.querySelector('#chatSuggestions');
    const form = widget.querySelector('#chatForm');
    const input = widget.querySelector('#chatInput');

    function addMessage(text, sender, link) {
        const message = document.createElement('div');
        message.className = `chat-message chat-message-${sender}`;
        message.textContent = text;
        messages.appendChild(message);

        if (link) {
            const action = document.createElement('a');
            action.className = 'chat-action';
            action.href = link.href;
            action.textContent = link.label;
            messages.appendChild(action);
        }

        messages.scrollTop = messages.scrollHeight;
    }

    function setSuggestions(items) {
        suggestions.replaceChildren();
        items.forEach((text) => {
            const button = document.createElement('button');
            button.className = 'chat-suggestion';
            button.type = 'button';
            button.textContent = text;
            button.addEventListener('click', () => ask(text));
            suggestions.appendChild(button);
        });
    }

    function normalize(text) {
        return text.toLocaleLowerCase('vi')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd');
    }

    function replyTo(question) {
        const text = normalize(question);

        if (/hoc phi|gia tien|bao nhieu tien|chi phi|180\.?000|180k/.test(text)) {
            return {
                text: 'Trang khóa học hiện niêm yết Vật lý THPTQG và Toán THPTQG ở mức 180.000đ/buổi. Một số khóa chưa có học phí rõ ràng trên website, nên bạn vui lòng liên hệ để xác nhận mức phí và lịch phù hợp.',
                link: { href: 'courses.html', label: 'Xem các khóa học' }
            };
        }
        if (/lich hoc|thoi gian|gio hoc|hoc luc nao|buoi sang|buoi toi/.test(text)) {
            return {
                text: 'Lịch học tham khảo: sáng 8:00–11:30, chiều 13:30–17:00 và tối 18:30–20:30. Gia đình có thể trao đổi để chọn khung giờ phù hợp.',
                link: { href: 'courses.html', label: 'Xem lịch học' }
            };
        }
        if (/hoc thu|thu mien phi|mien phi|dang ky|tu van|lien he|dien thoai|email|dia chi|gap tu van/.test(text)) {
            return {
                text: 'MekaSTEM có buổi học thử miễn phí 30 phút. Bạn có thể đăng ký tư vấn qua biểu mẫu, gọi 0865 190 99 hoặc email mekastem@gmail.com. Đội ngũ tư vấn hỗ trợ hằng ngày từ 8:00 đến 20:00.',
                link: { href: 'contact.html', label: 'Đăng ký tư vấn' }
            };
        }
        if (/lop 10|lop 12|thcs|thpt|cap 2|cap 3|tieu hoc|do tuoi|hoc sinh lop/.test(text)) {
            return {
                text: 'MekaSTEM hiện có chương trình Toán THCS–THPT, ôn thi vào lớp 10, Toán & Khoa học, Vật lý THCS–THPT và ôn thi THPTQG. Hãy cho mình biết lớp, môn học và mục tiêu của học sinh để được gợi ý sát hơn.',
                link: { href: 'courses.html', label: 'Tìm hiểu khóa học' }
            };
        }
        if (/vat ly|ly hoc|toan|coding|lap trinh|khoa hoc|stem|khoa hoc nao|mon hoc/.test(text)) {
            return {
                text: 'Các chương trình nổi bật gồm Toán THCS–THPT, Toán & Khoa học, Vật lý THCS–THPT, ôn thi vào lớp 10 và ôn thi THPTQG. MekaSTEM có lớp 1:1 và nhóm nhỏ, với lộ trình theo mục tiêu của học sinh.',
                link: { href: 'courses.html', label: 'Xem chi tiết khóa học' }
            };
        }
        if (/gia su|giao vien|phuong phap|lo trinh|tien do|bao cao|hoc nhu the nao/.test(text)) {
            return {
                text: 'MekaSTEM đánh giá đầu vào, thiết kế lộ trình theo năng lực, dạy tương tác và theo dõi tiến độ định kỳ. Hình thức học gồm 1:1 hoặc nhóm nhỏ; phụ huynh có thể trao đổi để điều chỉnh mục tiêu.',
                link: { href: 'about.html', label: 'Tìm hiểu về MekaSTEM' }
            };
        }
        return {
            text: 'Mình có thể hỗ trợ về khóa học, học phí, lịch học và đăng ký học thử. Bạn cho mình biết môn học, lớp của học sinh hoặc điều bạn muốn tìm hiểu nhé. Nếu cần tư vấn trực tiếp, MekaSTEM có thể hỗ trợ qua biểu mẫu.',
            link: { href: 'contact.html', label: 'Liên hệ tư vấn' }
        };
    }

    function ask(question) {
        const value = question.trim();
        if (!value) return;

        addMessage(value, 'user');
        input.value = '';
        setSuggestions([]);

        const response = replyTo(value);
        window.setTimeout(() => {
            addMessage(response.text, 'assistant', response.link);
            setSuggestions(['Học phí các khóa học?', 'Lịch học như thế nào?', 'Đăng ký học thử']);
        }, 250);
    }

    function setOpen(open) {
        panel.hidden = !open;
        launcher.setAttribute('aria-expanded', String(open));
        if (open) input.focus();
    }

    launcher.addEventListener('click', () => setOpen(panel.hidden));
    closeButton.addEventListener('click', () => setOpen(false));
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        ask(input.value);
    });
    widget.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
            setOpen(false);
            launcher.focus();
        }
    });

    addMessage('Xin chào! Mình là trợ lý tư vấn MekaSTEM. Bạn muốn tìm hiểu về khóa học, học phí hay lịch học?', 'assistant');
    setSuggestions(['Khóa học phù hợp cho con?', 'Học phí các khóa học?', 'Đăng ký học thử']);
})();
