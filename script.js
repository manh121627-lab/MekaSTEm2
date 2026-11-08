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

        if (formStatus) {
            formStatus.textContent = 'Cảm ơn bạn! Thông tin đã được ghi nhận. Chúng tôi sẽ liên hệ lại sớm.';
        }

        contactForm.reset();
    });
}
