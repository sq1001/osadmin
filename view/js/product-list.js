layui.use(['table', 'form'], function(){
  var table = layui.table;
  var form = layui.form;

  table.render({
    elem: '#productTable',
    url: 'view/data/product-list.json',
    toolbar: '#tableToolbar',
    defaultToolbar: ['filter', 'exports', 'print'],
    cols: [[
      {type: 'checkbox', fixed: 'left'},
      {field: 'id', title: 'ID', width: 80, sort: true},
      {field: 'name', title: '商品名称', width: 200},
      {field: 'category', title: '分类', width: 120},
      {field: 'price', title: '价格', width: 100, templet: '#priceTpl'},
      {field: 'stock', title: '库存', width: 100, sort: true},
      {field: 'sales', title: '销量', width: 100, sort: true},
      {field: 'status', title: '状态', width: 100, templet: '#statusTpl'},
      {field: 'createTime', title: '创建时间', width: 160},
      {fixed: 'right', title: '操作', toolbar: '#tableOperate', width: 150}
    ]],
    page: true,
    limit: 10,
    limits: [10, 20, 50, 100]
  });

  table.on('toolbar(productTable)', function(obj){
    var checkStatus = table.checkStatus(obj.config.id);
    switch(obj.event){
      case 'batchAdd':
        layer.msg('批量添加');
        break;
      case 'batchDel':
        layer.msg('批量删除');
        break;
    }
  });

  table.on('tool(productTable)', function(obj){
    var data = obj.data;
    switch(obj.event){
      case 'edit':
        layer.msg('编辑：' + data.name);
        break;
      case 'del':
        layer.confirm('确定删除【' + data.name + '】吗？', function(index){
          obj.del();
          layer.close(index);
        });
        break;
    }
  });

  form.on('submit(searchForm)', function(data){
    table.reload('productTable', {
      where: data.field,
      page: {curr: 1}
    });
    return false;
  });

  $('#addProductBtn').on('click', function(){
    layer.msg('添加商品');
  });

  $('#exportBtn').on('click', function(){
    layer.msg('导出数据');
  });
});
