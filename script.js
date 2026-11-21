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

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
        }
        if (formStatus) {
            formStatus.textContent = 'Đang gửi thông tin...';
        }

        fetch('https://formsubmit.co/ajax/hello@mekastem.vn', {
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
                    formStatus.textContent = 'Chưa gửi được thông tin. Vui lòng thử lại hoặc liên hệ qua hello@mekastem.vn.';
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
