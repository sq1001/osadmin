/**
 * 浏览页面顶部搜索框展开收回控制
 * 仅对字段项（.layui-form-item:not(.form-actions)）生效
 * 按钮区域（.form-actions）用 absolute 固定右侧，不参与展开/收起
 */
function toggleSearchFormShow()
{
    let $ = layui.$;
    // 仅选取字段项，排除按钮区域
    let items = $('.top-search-from .layui-form-item').not('.form-actions');
    if (items.length === 0) {
        $('.top-search-from').parent().parent().remove();
        return;
    }
    if (items.length === 1) {
        // 只有一个字段，无需展开/收起
        return;
    }

    let btns = $('.top-search-from .toggle-btn a');
    let toggle = toggleSearchFormShow;

    // 显式初始化为收起状态
    if (typeof toggle.hide === 'undefined') {
        toggle.hide = true;
        btns.on('click', function () {
            toggle();
        });
    }

    // 第一行可容纳字段数：可用宽度 / 单字段宽度（含 margin）
    // 可用宽度 = 表单内容宽度（已通过 padding-right 预留按钮空间）
    let formWidth = $('.top-search-from').width();
    // .width() 返回 content-box 宽度，已排除 padding，即为字段可用宽度
    let itemWidth = items.first().outerWidth(true); // 370 + 10 = 380
    // 边界修正：最后一个字段无需 right margin，+marginRight 补偿
    let marginRight = parseInt(items.first().css('margin-right')) || 0;
    let countPerRow = Math.max(1, Math.floor((formWidth + marginRight) / itemWidth));

    // 字段数不超过一行，无需展开/收起
    if (items.length <= countPerRow) {
        items.show();
        btns.addClass('layui-hide');
        return;
    }

    // 根据当前状态切换显示
    btns.removeClass('layui-hide');
    if (toggle.hide) {
        // 收起状态：仅显示第一行字段，隐藏超出部分
        // 显示"展开"按钮（提示下一步操作）
        items.each(function (index) {
            if (index < countPerRow) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        btns.filter(':first').removeClass('layui-hide'); // 显示"展开"
        btns.filter(':last').addClass('layui-hide');     // 隐藏"收起"
    } else {
        // 展开状态：显示所有字段
        // 显示"收起"按钮（提示下一步操作）
        items.show();
        btns.filter(':first').addClass('layui-hide');    // 隐藏"展开"
        btns.filter(':last').removeClass('layui-hide');  // 显示"收起"
    }
}

layui.use(['jquery'], function() {
    var $ = layui.$;
    $(function () {
        toggleSearchFormShow();

        // 窗口尺寸变化时重新计算
        var resizeTimer = null;
        $(window).on('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                // 重置状态为收起，重新计算
                toggleSearchFormShow.hide = undefined;
                toggleSearchFormShow();
            }, 200);
        });
    });
});
