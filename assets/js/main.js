/**
 * AESTRA - Main Application Script
 * Pure Vanilla JavaScript for GitHub Pages drag & drop deployment.
 * Supports: Cart, LocalStorage, Telegram Ordering, Search, Wishlist, Modals, Responsive Drawer.
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    CART: 'aestra_cart_v1',
    WISHLIST: 'aestra_wishlist_v1',
    COUPON: 'aestra_coupon_v1'
  };

  // Seed default cart items matching Stitch design if storage is empty
  function initDefaultCartIfEmpty() {
    const existing = localStorage.getItem(STORAGE_KEYS.CART);
    if (!existing) {
      const defaultItems = [
        {
          id: 'item-1',
          productId: 'AES-SH-2024-08',
          title: 'شومیز پلیسه ابریشم لنین آسترا',
          collection: 'AESTRA ATELIER',
          code: 'AES-SH-2024-08',
          color: 'کرم شنی',
          colorHex: '#E8DEC9',
          size: '۳۸ (M)',
          unitPrice: 1650000,
          quantity: 1,
          tag: 'کالکشن جدید',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU2q89hQ0xAqOcy-_2Gbd40pBi0IvXTNctqkUdisSquqq1QK9I9JHqlKDqB12q1B4UX3q38FU8_ZJtE0hTSLmCL54nKmNrPJsJH2QXTKdznJz6OWhQbQXzJCqAWZOjihQKc-SdLV6RwD50k_A6F8gat1eZvd9P0suCAczCGYBRYz3j6yvC5jEstLtRa_4EiEigLBdKfkI2g4O7NhFtc5fAzWba6AtdPjKanoQgWOCul5zZIOqTHQ-d'
        },
        {
          id: 'item-2',
          productId: 'AES-TR-5510',
          title: 'شلوار واید لگ پشم و لنین زیتونی',
          collection: 'AESTRA TAILORING',
          code: 'AES-TR-5510',
          color: 'سبز زیتونی ملایم',
          colorHex: '#555C41',
          size: '۴۰ (L)',
          unitPrice: 1820000,
          quantity: 1,
          tag: 'پرفروش‌ترین',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLca4L2IBWZXFbE-BaNiqc6zVGa7k0rNNVX6Xs4F_s8gUFzIKneSCVfNwgcxEz_o2o9ifxHPn-R6uut4zxQuAmGq-A-D5R8vHc6sv4FTfeB71uMegPWJqrngFeEgQBPP3ZPzmu9InH4TNufsKUCIbe-kNnBCBHA7uOqgnbbrbiL2v39eQATQaFF7LepRmWeL_3VWuOx9nUy2mHZ_jTRx9t21UU40OTfexPwecOIj_8TvXNX4iFePw1'
        },
        {
          id: 'item-3',
          productId: 'AES-TS-9018',
          title: 'تیشرت اورسایز واش ذغالی ۱۰۰٪ پنبه',
          collection: 'AESTRA ESSENTIALS',
          code: 'AES-TS-9018',
          color: 'خاکستری ذغالی تیره',
          colorHex: '#414244',
          size: 'فری‌سایز (Over)',
          unitPrice: 890000,
          quantity: 2,
          tag: 'تخفیف ویژه',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh3lB7bkJyAoH8UjMB1Sc430KiG-gMWVzajeUpv3IeAIwsubl-qYZ1480p_bJv_b1qGggzO1mf-4cGpnnFCvl9NsHgyg3iWqM-84dSNVo3uiQDkCB-TUoHNaDkiZ5rvtT6-4EFuhbYzWtMzkn-Z61H5YYblykJz0Z9lYusKgOWCB_dJ4SH6zefhLEaA5DeYhF70on9dyiMsNKXBuBMsXQ-HrJEn-HwIIujgNpmh87gkMC87cVo-z9c'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(defaultItems));
    }

    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(['AES-SH-2024-08', 'AES-TR-5510']));
    }
  }

  initDefaultCartIfEmpty();

  // --- Cart Helpers ---
  window.AestraCart = {
    getItems: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
      } catch (e) {
        return [];
      }
    },
    saveItems: function (items) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
      window.AestraCart.updateBadges();
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: items }));
    },
    addItem: function (item) {
      const items = window.AestraCart.getItems();
      // Match existing by product ID, color, and size
      const existing = items.find(
        (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
      );
      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        items.push({
          id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          productId: item.productId,
          title: item.title,
          collection: item.collection || 'AESTRA',
          code: item.code || item.productId,
          color: item.color || 'استاندارد',
          colorHex: item.colorHex || '#ccc',
          size: item.size || 'استاندارد',
          unitPrice: item.unitPrice || item.price,
          quantity: item.quantity || 1,
          tag: item.tag || '',
          image: item.image
        });
      }
      window.AestraCart.saveItems(items);
      showToast(`«${item.title}» به سبد خرید اضافه شد.`);
    },
    updateQuantity: function (itemId, delta) {
      let items = window.AestraCart.getItems();
      const target = items.find((i) => i.id === itemId);
      if (target) {
        target.quantity += delta;
        if (target.quantity <= 0) {
          items = items.filter((i) => i.id !== itemId);
          showToast('کالا از سبد خرید حذف شد.');
        }
        window.AestraCart.saveItems(items);
      }
    },
    removeItem: function (itemId) {
      let items = window.AestraCart.getItems();
      items = items.filter((i) => i.id !== itemId);
      window.AestraCart.saveItems(items);
      showToast('کالا از سبد خرید حذف شد.');
    },
    clearCart: function () {
      window.AestraCart.saveItems([]);
      showToast('سبد خرید کاملاً خالی شد.');
    },
    getTotalCount: function () {
      const items = window.AestraCart.getItems();
      return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    },
    getSubtotal: function () {
      const items = window.AestraCart.getItems();
      return items.reduce((sum, item) => sum + item.unitPrice * (item.quantity || 1), 0);
    },
    updateBadges: function () {
      const count = window.AestraCart.getTotalCount();
      document.querySelectorAll('.cart-count-badge').forEach((badge) => {
        badge.textContent = Number(count).toLocaleString('fa-IR');
        if (count === 0) {
          badge.classList.add('opacity-80');
        } else {
          badge.classList.remove('opacity-80');
        }
      });
    }
  };

  // --- Wishlist Helpers ---
  window.AestraWishlist = {
    getIds: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST)) || [];
      } catch (e) {
        return [];
      }
    },
    toggle: function (productId, buttonElement) {
      let list = window.AestraWishlist.getIds();
      const idx = list.indexOf(productId);
      const isAdding = idx === -1;
      if (isAdding) {
        list.push(productId);
        showToast('به لیست علاقه‌مندی‌ها اضافه شد.');
      } else {
        list.splice(idx, 1);
        showToast('از لیست علاقه‌مندی‌ها برداشته شد.');
      }
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
      window.AestraWishlist.updateBadges();

      if (buttonElement) {
        const icon = buttonElement.querySelector('.material-symbols-outlined');
        if (icon) {
          if (isAdding) {
            icon.classList.add('fill');
            icon.style.fontVariationSettings = "'FILL' 1";
            buttonElement.classList.add('text-terracotta-accent');
          } else {
            icon.classList.remove('fill');
            icon.style.fontVariationSettings = "'FILL' 0";
            buttonElement.classList.remove('text-terracotta-accent');
          }
        }
      }
    },
    updateBadges: function () {
      const count = window.AestraWishlist.getIds().length;
      document.querySelectorAll('.wishlist-count-badge').forEach((badge) => {
        badge.textContent = Number(count).toLocaleString('fa-IR');
      });
    }
  };

  // --- Toast Notification System ---
  function showToast(message, icon = 'shopping_bag') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[18px] text-terracotta-accent">${icon}</span>
      <span class="font-medium">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }
  window.showToast = showToast;

  // --- Telegram Order Generator ---
  window.AestraTelegramOrder = {
    openModal: function () {
      const modal = document.getElementById('telegram-order-modal');
      if (!modal) {
        window.AestraTelegramOrder.renderModal();
      }
      const m = document.getElementById('telegram-order-modal');
      if (m) {
        m.classList.remove('hidden');
        window.AestraTelegramOrder.updateModalPreview();
      }
    },
    closeModal: function () {
      const m = document.getElementById('telegram-order-modal');
      if (m) m.classList.add('hidden');
    },
    renderModal: function () {
      const div = document.createElement('div');
      div.id = 'telegram-order-modal';
      div.className = 'fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4 hidden';
      div.innerHTML = `
        <div class="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in text-right">
          <div class="flex items-center justify-between pb-3 border-b border-border-hairline mb-4">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-secondary text-on-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">send</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-primary font-bold">ثبت و ارسال سفارش در تلگرام</h3>
                <p class="font-body-sm text-[12px] text-text-muted">مشاوران آسترا فوراً سفارش شما را آماده و ارسال می‌کنند</p>
              </div>
            </div>
            <button onclick="window.AestraTelegramOrder.closeModal()" class="w-8 h-8 rounded-full bg-surface-cream text-text-muted hover:text-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <form id="telegram-checkout-form" onsubmit="window.AestraTelegramOrder.submit(event)" class="flex flex-col gap-3">
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1 font-semibold">نام و نام خانوادگی خریدار *</label>
              <input required id="tg-name" type="text" placeholder="مثلاً: مریم احمدی" class="w-full bg-surface-cream rounded-lg px-3 py-2 text-body-md outline-none border border-transparent focus:border-primary transition-all" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-1 font-semibold">شماره موبایل *</label>
                <input required id="tg-phone" type="tel" placeholder="۰۹۱۲XXXXXXX" class="w-full bg-surface-cream rounded-lg px-3 py-2 text-body-md outline-none border border-transparent focus:border-primary transition-all text-left" dir="ltr" />
              </div>
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-1 font-semibold">شهر / استان</label>
                <input required id="tg-city" type="text" placeholder="تهران" value="تهران" class="w-full bg-surface-cream rounded-lg px-3 py-2 text-body-md outline-none border border-transparent focus:border-primary transition-all" />
              </div>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1 font-semibold">نشانی کامل پستی جهت تحویل اکسپرس *</label>
              <textarea required id="tg-address" rows="2" placeholder="خیابان، کوچه، پلاک، زنگ، کدپستی..." class="w-full bg-surface-cream rounded-lg px-3 py-2 text-body-md outline-none border border-transparent focus:border-primary transition-all"></textarea>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">یادداشت برای آتلیه یا پرو همزمان (اختیاری)</label>
              <input id="tg-notes" type="text" placeholder="مثلاً ارسال بین ساعت ۱۴ تا ۱۸ یا نیاز به کاور هدیه" class="w-full bg-surface-cream rounded-lg px-3 py-2 text-body-md outline-none border border-transparent focus:border-primary transition-all" />
            </div>

            <!-- Preview Box -->
            <div class="bg-surface-cream p-3 rounded-xl border border-border-hairline text-body-sm flex flex-col gap-1.5 mt-1">
              <div class="flex items-center justify-between font-bold text-primary">
                <span>پیش‌فاکتور اقلام سبد:</span>
                <span id="tg-preview-total">۰ تومان</span>
              </div>
              <div id="tg-preview-items" class="text-text-muted text-[12px] flex flex-col gap-0.5 max-h-24 overflow-y-auto"></div>
            </div>

            <div class="flex flex-col gap-2 pt-2">
              <button type="submit" class="w-full bg-primary text-on-primary py-3 rounded-lg font-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-md group">
                <span class="material-symbols-outlined text-[20px]">send</span>
                <span>ارسال مستقیم سفارش در تلگرام</span>
              </button>

              <div class="flex items-center gap-2">
                <button type="button" onclick="window.AestraTelegramOrder.copyText()" class="flex-1 bg-surface-cream hover:bg-surface-container text-primary py-2.5 rounded-lg font-label-md transition-colors text-center">
                  کپی متن پیش‌فاکتور
                </button>
                <button type="button" onclick="window.AestraTelegramOrder.submitWhatsApp()" class="flex-1 bg-[#25D366] text-white py-2.5 rounded-lg font-label-md transition-colors text-center hover:opacity-90">
                  سفارش در واتس‌اپ
                </button>
              </div>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(div);
    },
    updateModalPreview: function () {
      const items = window.AestraCart.getItems();
      const listEl = document.getElementById('tg-preview-items');
      const totalEl = document.getElementById('tg-preview-total');
      if (!listEl || !totalEl) return;

      if (items.length === 0) {
        listEl.innerHTML = '<span>سبد خرید شما خالی است.</span>';
        totalEl.textContent = '۰ تومان';
        return;
      }

      let subtotal = 0;
      let html = '';
      items.forEach((item, idx) => {
        const itemTotal = item.unitPrice * item.quantity;
        subtotal += itemTotal;
        html += `<div>${idx + 1}. ${item.title} (${item.color} - ${item.size}) × ${item.quantity} = ${itemTotal.toLocaleString('fa-IR')} تومان</div>`;
      });
      listEl.innerHTML = html;
      totalEl.textContent = subtotal.toLocaleString('fa-IR') + ' تومان';
    },
    generateMessage: function () {
      const name = document.getElementById('tg-name')?.value || 'خریدار گرامی';
      const phone = document.getElementById('tg-phone')?.value || 'ثبت نشده';
      const city = document.getElementById('tg-city')?.value || 'تهران';
      const address = document.getElementById('tg-address')?.value || 'ثبت نشده';
      const notes = document.getElementById('tg-notes')?.value || 'بدون یادداشت';

      const items = window.AestraCart.getItems();
      let itemsText = '';
      let subtotal = 0;
      items.forEach((item, idx) => {
        const itemTotal = item.unitPrice * item.quantity;
        subtotal += itemTotal;
        itemsText += `${idx + 1}️⃣ ${item.title}\n   🔹 رنگ: ${item.color} | سایز: ${item.size}\n   🔹 تعداد: ${item.quantity} عدد | قیمت: ${itemTotal.toLocaleString('fa-IR')} تومان\n\n`;
      });

      const message = `🛍 *سفارش جدید از فروشگاه آنلاین آسترا (AESTRA)*\n\n` +
        `👤 *نام خریدار:* ${name}\n` +
        `📞 *شماره تماس:* ${phone}\n` +
        `🏙 *شهر:* ${city}\n` +
        `📍 *نشانی تحویل:* ${address}\n` +
        `📝 *توضیحات:* ${notes}\n\n` +
        `───────────────────\n` +
        `📦 *اقلام سفارش:*\n` +
        `${itemsText}` +
        `───────────────────\n` +
        `💰 *مبلغ کل قابل پرداخت:* ${subtotal.toLocaleString('fa-IR')} تومان\n` +
        `🚚 *هزینه ارسال:* رایگان (اکسپرس اختصاصی آسترا)\n` +
        `✨ سپاس از انتخاب آتلیه مد معاصر آسترا.`;

      return message;
    },
    submit: function (e) {
      if (e) e.preventDefault();
      const items = window.AestraCart.getItems();
      if (items.length === 0) {
        showToast('سبد خرید شما خالی است!');
        return;
      }
      const settings = (window.AestraConfig && window.AestraConfig.getSettings()) || {};
      const tgUsername = settings.telegramUsername ? settings.telegramUsername.replace('@', '').trim() : 'aestra_atelier';
      const tgUrl = `https://t.me/${tgUsername}?text=${encodeURIComponent(message)}`;
      window.open(tgUrl, '_blank');
      showToast('در حال انتقال به تلگرام برای تایید سفارش...');
      window.AestraTelegramOrder.closeModal();
    },
    submitWhatsApp: function () {
      const items = window.AestraCart.getItems();
      if (items.length === 0) {
        showToast('سبد خرید شما خالی است!');
        return;
      }
      const message = window.AestraTelegramOrder.generateMessage();
      const settings = (window.AestraConfig && window.AestraConfig.getSettings()) || {};
      const phone = settings.whatsappNumber ? settings.whatsappNumber.replace(/[^0-9]/g, '').trim() : '989123456789';
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      showToast('در حال انتقال به واتس‌اپ برای تایید سفارش...');
      window.AestraTelegramOrder.closeModal();
    },
    copyText: function () {
      const message = window.AestraTelegramOrder.generateMessage();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(message).then(() => {
          showToast('متن پیش‌فاکتور با موفقیت در کلیپ‌بورد کپی شد.');
        });
      } else {
        showToast('متن کپی شد.');
      }
    }
  };

  // --- Real-time Search Dropdown & Handling ---
  function setupSearch() {
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="جستجو"]');
    searchInputs.forEach((input) => {
      const parent = input.closest('div');
      if (!parent) return;

      // Create dropdown
      let dropdown = parent.querySelector('.search-results-dropdown');
      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className =
          'search-results-dropdown absolute top-full right-0 left-0 mt-2 bg-surface-container-lowest rounded-xl shadow-xl border border-border-hairline p-2 hidden z-50 max-h-80 overflow-y-auto animate-fade-in text-right';
        parent.style.position = 'relative';
        parent.appendChild(dropdown);
      }

      input.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();
        if (query.length < 2) {
          dropdown.classList.add('hidden');
          return;
        }

        const products = window.AESTRA_PRODUCTS || [];
        const matches = products.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.categoryFa.toLowerCase().includes(query) ||
            p.shortTitle.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
          dropdown.innerHTML = `<div class="p-3 text-center text-text-muted text-body-sm">موردی برای «${query}» یافت نشد.</div>`;
          dropdown.classList.remove('hidden');
          return;
        }

        dropdown.innerHTML = matches
          .slice(0, 5)
          .map(
            (p) => `
            <a href="product-detail.html?id=${p.id}" class="flex items-center gap-3 p-2 hover:bg-surface-cream rounded-lg transition-colors">
              <img src="${p.image}" class="w-12 h-14 object-cover rounded bg-surface-subtle" alt="${p.shortTitle}" />
              <div class="flex-1 min-w-0">
                <div class="font-label-md text-primary truncate font-semibold">${p.shortTitle}</div>
                <div class="text-[12px] text-text-muted">${p.categoryFa}</div>
              </div>
              <span class="font-bold text-label-md text-primary whitespace-nowrap">${Number(p.price).toLocaleString('fa-IR')} تومان</span>
            </a>
          `
          )
          .join('');

        dropdown.innerHTML += `
          <div class="border-t border-border-hairline mt-1 pt-1 text-center">
            <a href="products.html?q=${encodeURIComponent(query)}" class="block py-1.5 text-secondary text-label-sm font-semibold hover:underline">
              مشاهده همه نتایج (${matches.length.toLocaleString('fa-IR')} کالا)
            </a>
          </div>
        `;

        dropdown.classList.remove('hidden');
      });

      // Handle enter key
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          const query = this.value.trim();
          if (query) {
            window.location.href = `products.html?q=${encodeURIComponent(query)}`;
          }
        }
      });
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-results-dropdown') && !e.target.closest('input[type="text"]')) {
        document.querySelectorAll('.search-results-dropdown').forEach((d) => d.classList.add('hidden'));
      }
    });
  }

  // --- Mobile Navigation Drawer ---
  function setupMobileMenu() {
    let drawer = document.getElementById('mobile-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'mobile-drawer';
      drawer.className =
        'fixed inset-0 z-[90] bg-primary/60 backdrop-blur-sm hidden transition-opacity duration-300';
      drawer.innerHTML = `
        <div class="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-surface-container-lowest shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-right text-right">
          <div class="flex flex-col gap-5">
            <div class="flex items-center justify-between border-b border-border-hairline pb-4">
              <div class="flex items-center gap-2">
                <span class="font-headline-sm text-primary font-bold tracking-wider">AESTRA</span>
                <span class="text-[11px] bg-surface-cream text-text-muted px-2 py-0.5 rounded">آتلیه تهران</span>
              </div>
              <button id="close-mobile-drawer" class="w-8 h-8 rounded-full bg-surface-cream flex items-center justify-center text-text-muted hover:text-primary">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <!-- Prominent Mobile Admin Entry Card -->
            <a href="admin.html" class="p-3 bg-gradient-to-r from-primary to-neutral-800 text-on-primary rounded-xl flex items-center justify-between shadow-sm hover:opacity-95 transition-all border border-neutral-700 active:scale-95">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-warm-amber/20 text-warm-amber flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                </div>
                <div class="text-right min-w-0">
                  <div class="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>پنل مدیریت فروشگاه</span>
                    <span class="text-[9px] bg-warm-amber text-primary px-1.5 py-0.2 rounded-full font-bold">ورود</span>
                  </div>
                  <div class="text-[10px] text-gray-300 mt-0.5 truncate">عکاسی و آپلود از گوشی، قیمت‌ها و بنرها</div>
                </div>
              </div>
              <span class="material-symbols-outlined text-gray-300 text-[18px] shrink-0">chevron_left</span>
            </a>

            <nav class="flex flex-col gap-1.5 font-label-md">
              <a href="index.html" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span>صفحه اصلی</span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
              <a href="products.html?cat=new" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <span>جدیدترین‌ها</span>
                  <span class="bg-warm-amber text-on-primary text-[10px] px-1.5 py-0.5 rounded-full">جدید</span>
                </span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
              <a href="products.html?cat=t-shirts" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span>تیشرت و بیسیک</span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
              <a href="products.html?cat=shirts-and-blouses" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span>شومیز و پیراهن</span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
              <a href="products.html?cat=trousers" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span>شلوار و دامن</span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
              <a href="products.html?cat=coordinated-sets" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span>ست لباس و کت</span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
              <a href="products.html?cat=accessories" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span>اکسسوری و چرم</span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
              <a href="products.html?cat=sale" class="px-3 py-2.5 rounded-lg text-terracotta-accent hover:bg-surface-cream flex items-center justify-between font-bold">
                <span class="flex items-center gap-2">
                  <span>تخفیف‌های ویژه</span>
                  <span class="bg-terracotta-accent text-on-primary text-[10px] px-1.5 py-0.5 rounded-full font-normal">فروش ویژه</span>
                </span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
              <a href="cart.html" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span>سبد خرید شما</span>
                <span class="cart-count-badge bg-primary text-on-primary text-[11px] px-2 py-0.5 rounded-full">۳</span>
              </a>
              <a href="about.html" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span>درباره ما و آتلیه</span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
              <a href="contact.html" class="px-3 py-2.5 rounded-lg text-primary hover:bg-surface-cream flex items-center justify-between">
                <span>تماس با ما و آدرس</span>
                <span class="material-symbols-outlined text-[16px] text-text-muted">chevron_left</span>
              </a>
            </nav>
          </div>

          <div class="border-t border-border-hairline pt-4 flex flex-col gap-3">
            <button onclick="window.AestraTelegramOrder.openModal()" class="w-full bg-primary text-on-primary py-2.5 rounded-lg font-label-md flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">send</span>
              <span>سفارش سریع در تلگرام</span>
            </button>
            <div id="drawer-shipping-notice" class="text-[11px] text-text-muted text-center">
              ارسال رایگان برای خریدهای بالای ۱۰,۰۰۰,۰۰۰ تومان
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(drawer);

      document.getElementById('close-mobile-drawer')?.addEventListener('click', () => {
        drawer.classList.add('hidden');
      });

      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) drawer.classList.add('hidden');
      });
    }

    // Connect hamburger buttons
    document.querySelectorAll('.mobile-menu-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        drawer.classList.remove('hidden');
      });
    });

    // Mobile Header Admin Link Icon
    const headerActions = document.querySelector('header .flex.items-center.gap-space-sm');
    if (headerActions && !document.getElementById('mobile-header-admin-link')) {
      const adminBtn = document.createElement('a');
      adminBtn.id = 'mobile-header-admin-link';
      adminBtn.href = 'admin.html';
      adminBtn.className = 'lg:hidden p-1.5 text-primary hover:bg-surface-cream rounded-lg transition-colors flex items-center justify-center border border-border-hairline/60 bg-surface-cream/50 active:scale-95';
      adminBtn.title = 'ورود به پنل مدیریت فروشگاه';
      adminBtn.innerHTML = `
        <span class="material-symbols-outlined text-[20px] text-secondary">admin_panel_settings</span>
      `;
      headerActions.insertBefore(adminBtn, headerActions.firstChild);
    }
  }

  // --- Dynamic DOM Settings Hydrator ---
  function applyDynamicSiteSettings() {
    if (!window.AestraConfig) return;
    const settings = window.AestraConfig.getSettings();

    // Announcement top bar
    if (settings.announcementText) {
      document.querySelectorAll('header .bg-primary .truncate').forEach(el => {
        el.textContent = settings.announcementText;
      });
    }

    // Drawer shipping notice
    const drawerNotice = document.getElementById('drawer-shipping-notice');
    if (drawerNotice && settings.freeShippingThreshold) {
      drawerNotice.textContent = `ارسال رایگان برای خریدهای بالای ${Number(settings.freeShippingThreshold).toLocaleString('fa-IR')} تومان`;
    }

    // Phone numbers in header/footer
    if (settings.phone) {
      document.querySelectorAll('header .tabular-nums').forEach(el => {
        el.textContent = settings.phone;
      });
    }

    // Dynamic Hero Banner on Homepage
    if (settings.heroSlides && settings.heroSlides.length > 0) {
      const heroSlide = settings.heroSlides[0];
      const heroSection = document.querySelector('section .min-h-\\[640px\\]');
      if (heroSection) {
        const heroImg = heroSection.querySelector('img');
        const heroBadge = heroSection.querySelector('.font-label-md');
        const heroTitle = heroSection.querySelector('h1');
        const heroSub = heroSection.querySelector('p');
        const heroBtn = heroSection.querySelector('a');

        if (heroImg && heroSlide.bgImage) heroImg.src = heroSlide.bgImage;
        if (heroBadge && heroSlide.badge) heroBadge.textContent = heroSlide.badge;
        if (heroTitle && heroSlide.title) heroTitle.innerHTML = heroSlide.title.replace(/\n/g, '<br />');
        if (heroSub && heroSlide.subtitle) heroSub.textContent = heroSlide.subtitle;
        if (heroBtn && heroSlide.btnText) {
          const span = heroBtn.querySelector('span');
          if (span) span.textContent = heroSlide.btnText;
          if (heroSlide.btnLink) heroBtn.href = heroSlide.btnLink;
        }
      }
    }

    // Add small subtle Admin Access button in footers if not present
    const footer = document.querySelector('footer');
    if (footer && !document.getElementById('footer-admin-link')) {
      const bottomBar = footer.querySelector('.border-t') || footer;
      const adminLinkWrap = document.createElement('div');
      adminLinkWrap.id = 'footer-admin-link';
      adminLinkWrap.className = 'text-center mt-3 pt-2 border-t border-border-hairline/40';
      adminLinkWrap.innerHTML = `
        <a href="admin.html" class="inline-flex items-center gap-1.5 text-[11px] text-text-muted/70 hover:text-primary transition-colors py-1 px-2.5 rounded hover:bg-surface-cream">
          <span class="material-symbols-outlined text-[14px]">tune</span>
          <span>مدیریت فروشگاه و محتوا (پنل ادمین)</span>
        </a>
      `;
      bottomBar.appendChild(adminLinkWrap);
    }
  }

  // --- Initializer on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    window.AestraCart.updateBadges();
    window.AestraWishlist.updateBadges();
    setupSearch();
    setupMobileMenu();
    applyDynamicSiteSettings();

    // Listen for settings change
    window.addEventListener('settingsUpdated', () => {
      applyDynamicSiteSettings();
    });

    // Setup telegram modal in advance
    window.AestraTelegramOrder.renderModal();

    // Auto-highlight active nav link based on current page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('header nav a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.className =
          'px-space-sm py-space-xs transition-all whitespace-nowrap text-primary font-bold bg-surface-container-low rounded-lg';
        link.setAttribute('aria-current', 'page');
      }
    });
  });
})();
