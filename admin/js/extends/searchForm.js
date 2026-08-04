/**
 * 浏览页面顶部搜索框展开收回控制
 * 布局：字段项在左侧 flex-wrap 流动，按钮区域 absolute 固定右上角
 * 展开/收起仅作用于字段项，按钮区域始终固定不移动
 */
function toggleSearchFormShow(flip)
{
    let $ = layui.$;
    let form = $('.top-search-from');
    if (form.length === 0) return;

    // 仅选取字段项，排除按钮区域
    let items = form.find('.layui-form-item').not('.form-actions');
    if (items.length === 0) {
        form.parent().parent().remove();
        return;
    }
    if (items.length === 1) {
        // 只有一个字段，无需展开/收起
        return;
    }

    let btns = form.find('.toggle-btn a');
    let toggle = toggleSearchFormShow;

    // 绑定点击事件（仅一次），显式初始化为收起状态
    if (!toggle.bound) {
        toggle.bound = true;
        toggle.hide = true;
        btns.on('click', function () {
            toggle(true); // 用户点击时翻转状态
        });
    }

    // 动态测量按钮区域宽度，精确预留右侧空间，字段可用宽度最大化
    // 仅桌面端（>768px）按钮 absolute 定位需预留空间；移动端按钮跟随流动，无需预留
    let isMobile = window.innerWidth <= 768;
    if (!isMobile) {
        let actionsWidth = form.find('.form-actions').outerWidth(true) || 180;
        form.css('padding-right', actionsWidth + 'px');
    } else {
        form.css('padding-right', '0');
    }

    // 第一行可容纳字段数：字段容器内容宽度 / 单字段宽度（含水平 margin）
    let formWidth = form.width(); // .width() 为 content-box，已排除 padding-right
    let itemWidth = items.first().outerWidth(true); // 370 + 10 = 380
    let marginRight = parseInt(items.first().css('margin-right')) || 0;
    // 边界修正：最后一个字段无 right margin，+marginRight 补偿
    let countPerRow = Math.max(1, Math.floor((formWidth + marginRight) / itemWidth));

    // 字段数不超过一行，无需展开/收起
    if (items.length <= countPerRow) {
        items.show();
        btns.addClass('layui-hide');
        return;
    }

    // 仅用户点击时翻转状态；初始化与 resize 保持当前状态，仅重算布局
    if (flip) {
        toggle.hide = !toggle.hide;
    }
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
        btns.eq(0).removeClass('layui-hide'); // 显示"展开"
        btns.eq(1).addClass('layui-hide');    // 隐藏"收起"
    } else {
        // 展开状态：显示所有字段
        // 显示"收起"按钮（提示下一步操作）
        items.show();
        btns.eq(0).addClass('layui-hide');    // 隐藏"展开"
        btns.eq(1).removeClass('layui-hide'); // 显示"收起"
    }
}

layui.use(['jquery'], function() {
    var $ = layui.$;
    $(function () {
        toggleSearchFormShow();

        // 窗口尺寸变化时重新计算（不重置用户当前展开/收起状态）
        var resizeTimer = null;
        $(window).on('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                toggleSearchFormShow();
            }, 200);
        });
    });
});
