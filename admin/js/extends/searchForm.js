/**
 * 浏览页面顶部搜索框展开收回控制
 */
function toggleSearchFormShow()
{
    let $ = layui.$;
    let items = $('.top-search-from .layui-form-item');
    if (items.length <= 2) {
        if (items.length <= 1) $('.top-search-from').parent().parent().remove();
        return;
    }
    let btns = $('.top-search-from .toggle-btn a');
    let toggle = toggleSearchFormShow;
    if (typeof toggle.hide === 'undefined') {
        btns.on('click', function () {
            toggle();
        });
    }
    // 可用宽度扣除右侧固定按钮区域（toggle-btn 已独立一行，不占第一行宽度）
    let formWidth = $('.top-search-from').width();
    let itemWidth = $('.layui-form-item').width();
    let actionsWidth = $('.top-search-from .form-actions').outerWidth(true) || 0;
    let availableWidth = formWidth - actionsWidth;
    let countPerRow = Math.max(2, parseInt(availableWidth / itemWidth));
    if (items.length <= countPerRow) {
        return;
    }
    btns.removeClass('layui-hide');
    toggle.hide = !toggle.hide;
    if (toggle.hide) {
        for (let i = countPerRow - 1; i < items.length - 1; i++) {
            $(items[i]).hide();
        }
        return $('.top-search-from .toggle-btn a:last').addClass('layui-hide');
    }
    items.show();
    $('.top-search-from .toggle-btn a:first').addClass('layui-hide');
}

layui.use(['jquery'], function() {
    var $ = layui.$;
    $(function () {
        toggleSearchFormShow();
    });
});

