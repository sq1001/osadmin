/**
 * 浏览页面顶部搜索框展开收回控制
 * 仅对字段项（.layui-form-item:not(.form-actions)）生效
 * 按钮区域（.form-actions）与展开/收起按钮（.toggle-btn）始终不参与展开/收起
 */
function toggleSearchFormShow()
{
    let $ = layui.$;
    // 仅选取字段项，排除按钮区域
    let items = $('.top-search-from .layui-form-item').not('.form-actions');
    if (items.length <= 1) {
        if (items.length === 0) $('.top-search-from').parent().parent().remove();
        return;
    }
    let btns = $('.top-search-from .toggle-btn a');
    let toggle = toggleSearchFormShow;
    if (typeof toggle.hide === 'undefined') {
        btns.on('click', function () {
            toggle();
        });
    }
    // 第一行可容纳字段数：可用宽度 / 单字段宽度
    // 可用宽度 = 表单总宽度 - 右侧按钮区域宽度（toggle-btn 已独立一行不占第一行）
    let formWidth = $('.top-search-from').width();
    let itemWidth = items.first().outerWidth(true);
    let actionsWidth = $('.top-search-from .form-actions').outerWidth(true) || 0;
    let availableWidth = formWidth - actionsWidth;
    let countPerRow = Math.max(1, parseInt(availableWidth / itemWidth));
    if (items.length <= countPerRow) {
        return;
    }
    btns.removeClass('layui-hide');
    toggle.hide = !toggle.hide;
    if (toggle.hide) {
        // 收起：仅显示第一行字段（前 countPerRow 个），其余隐藏
        items.each(function (index) {
            if (index >= countPerRow) {
                $(this).hide();
            }
        });
        $('.top-search-from .toggle-btn a:first').addClass('layui-hide');
    } else {
        // 展开：显示所有字段
        items.show();
        $('.top-search-from .toggle-btn a:last').addClass('layui-hide');
    }
}

layui.use(['jquery'], function() {
    var $ = layui.$;
    $(function () {
        toggleSearchFormShow();
    });
});
