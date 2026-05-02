(function() {
  // 只在首页执行
  if (window.location.pathname !== '/') return;

  document.addEventListener('DOMContentLoaded', function() {
    // 获取微博文数据
    fetch('/moments/')
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const items = doc.querySelectorAll('.shuoshuo-item');

        if (items.length === 0) return;

        // 创建预览容器
        const container = document.createElement('div');
        container.className = 'moments-widget';
        container.innerHTML = `
          <div class="moments-widget-title">
            <i class="fa-solid fa-comment-dots"></i> 最新微博文
          </div>
          <div class="moments-widget-content"></div>
          <a href="/moments/" class="moments-widget-more">查看全部 →</a>
        `;

        const content = container.querySelector('.moments-widget-content');

        // 显示最新 5 条
        const limit = Math.min(items.length, 5);
        for (let i = 0; i < limit; i++) {
          const item = items[i];
          const text = item.querySelector('.shuoshuo-content');
          const date = item.querySelector('.shuoshuo-date');

          if (text) {
            const preview = document.createElement('div');
            preview.className = 'moments-widget-item';
            // 截取前 50 个字符
            const textContent = text.textContent.trim().substring(0, 50);
            preview.innerHTML = `
              <p class="moments-widget-text">${textContent}${textContent.length >= 50 ? '...' : ''}</p>
              <span class="moments-widget-date">${date ? date.textContent : ''}</span>
            `;
            content.appendChild(preview);
          }
        }

        // 插入到侧边栏或主内容区
        const aside = document.querySelector('#aside-content') || document.querySelector('.aside-content');
        if (aside) {
          aside.insertBefore(container, aside.firstChild);
        }
      })
      .catch(err => console.log('Failed to load moments:', err));
  });
})();
