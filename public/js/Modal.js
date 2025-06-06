class Modal {
    constructor(modalId, options = {}) {
        this.modal = document.getElementById(modalId);
        this.form = this.modal.querySelector('form');
        this.closeBtn = this.modal.querySelector('.close');
        this.options = {
            onOpen: options.onOpen || (() => {}),
            onClose: options.onClose || (() => {}),
            resetFormOnClose: options.resetFormOnClose !== false,
            closeOnEscape: options.closeOnEscape !== false,
            closeOnClickOutside: options.closeOnClickOutside !== false
        };

        this.init();
    }

    init() {
        // Close button click
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Click outside
        if (this.options.closeOnClickOutside) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Escape key
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen()) {
                    this.close();
                }
            });
        }
    }

    open() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.options.onOpen();
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        if (this.form && this.options.resetFormOnClose) {
            this.form.reset();
        }
        
        this.options.onClose();
    }

    isOpen() {
        return this.modal.style.display === 'block';
    }
}
