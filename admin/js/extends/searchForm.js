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
    // 可用宽度需扣除右侧固定的按钮区域与展开/收起按钮
    let formWidth = $('.top-search-from').width();
    let itemWidth = $('.layui-form-item').width();
    let actionsWidth = $('.top-search-from .form-actions').outerWidth(true) || 0;
    let toggleWidth = $('.top-search-from .toggle-btn').outerWidth(true) || 0;
    let availableWidth = formWidth - actionsWidth - toggleWidth;
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

