(function() {
  function initMomentsWidget() {
    // 只在首页执行
    var isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
    if (!isHome) return;

    // 检查是否已存在 widget
    if (document.querySelector('.moments-widget')) return;

    // 获取微博文数据
    fetch('/moments/')
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 从 script 标签获取 JSON 数据
        const dataScript = doc.getElementById('shuoshuo-data');
        if (!dataScript) {
          console.log('[Moments Widget] No data found');
          return;
        }

        const moments = JSON.parse(dataScript.textContent);
        if (!moments || moments.length === 0) {
          console.log('[Moments Widget] No moments found');
          return;
        }

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
        const limit = Math.min(moments.length, 5);
        for (let i = 0; i < limit; i++) {
          const item = moments[i];
          const textContent = item.content.trim().substring(0, 50);
          const dateStr = formatDate(item.date);

          const preview = document.createElement('div');
          preview.className = 'moments-widget-item';
          preview.innerHTML = `
            <p class="moments-widget-text">${escapeHtml(textContent)}${textContent.length >= 50 ? '...' : ''}</p>
            <span class="moments-widget-date">${dateStr}</span>
          `;
          content.appendChild(preview);
        }

        // 插入到侧边栏 - 在 card-info 后面
        const aside = document.querySelector('#aside-content') || document.querySelector('.aside-content');
        if (aside) {
          const cardInfo = aside.querySelector('.card-widget.card-info');
          if (cardInfo) {
            cardInfo.after(container);
          } else {
            aside.insertBefore(container, aside.firstChild);
          }
        }
      })
      .catch(err => console.log('[Moments Widget] Error:', err));
  }

  // 格式化日期
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    } else if (days > 0) {
      return days + ' 天前';
    } else if (hours > 0) {
      return hours + ' 小时前';
    } else if (minutes > 0) {
      return minutes + ' 分钟前';
    } else {
      return '刚刚';
    }
  }

  // HTML 转义并去除标签
  function escapeHtml(text) {
    // 先去除 HTML 标签
    const div = document.createElement('div');
    div.innerHTML = text;
    const plainText = div.textContent || div.innerText || '';
    // 再转义
    div.textContent = plainText;
    return div.innerHTML;
  }

  // 初始加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMomentsWidget);
  } else {
    initMomentsWidget();
  }

  // PJAX 支持
  document.addEventListener('pjax:complete', initMomentsWidget);
})();
