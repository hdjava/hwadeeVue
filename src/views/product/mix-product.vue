<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-button
            type="info"
            icon="plus"
            @click="showCreate"
            v-if="hasPerm('yun:product:add')"
          >添加</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="list"
      v-loading.body="listLoading"
      element-loading-text="拼命加载中"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          <span>{{scope.$index+1 }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="id" label="商品ID" width="170"></el-table-column>
      <el-table-column align="center" prop="productName" label="商品信息" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="createTime" label="创建时间" width="170"></el-table-column>
      <el-table-column align="center" prop="updateTime" label="更新时间" width="170"></el-table-column>

      <el-table-column align="center" label="上架下架" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isDelete==0"
            :active-value="true"
            :inactive-value="false"
            disabled
          ></el-switch>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200" v-if="hasPerm('yun:product:update')">
        <template slot-scope="scope">
          <el-button
            type="danger"
            icon="edit"
            @click="showUpdate(scope.$index)"
            style="font-size: 9px;"
          >修改</el-button>
          <el-button
            type="info"
            icon="edit"
            @click="isDelete(scope.$index)"
            style="font-size: 9px;"
          >上/下架</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageRow"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        class="small-space"
        :model="tempProduct"
        label-position="left"
        label-width="90px"
        style="width: 500px; margin-left:50px;"
      >
        <el-form-item label="商品信息">
          <el-input type="text" v-model="tempProduct.productName"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='add'" type="info" @click="createProduct">创 建</el-button>
        <el-button type="info" v-else @click="updateProduct">修 改</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      total: 0, //分页组件--数据总条数
      list: [], //表格的数据
      listLoading: false, //数据加载等待动画
      listQuery: {
        pageNum: 1, //页码
        pageRow: 10, //每页条数
        name: ""
      },
      dialogStatus: "create",
      dialogFormVisible: false,
      textMap: {
        update: "编辑",
        create: "入库商品"
      },
      tempProduct: {
        id: "",
        productName: "",
        createTime: "",
        updateTime: "",
        isDelete: ""
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      //查询列表
      if (!this.hasPerm("yun:product:list")) {
        return;
      }
      this.listLoading = true;
      this.api({
        url: "yun/product/list",
        method: "get",
        params: this.listQuery
      }).then(data => {
        this.listLoading = false;
        this.list = data.records;
        this.total = data.total;
        this.pageNum = data.current;
        this.pageRow = data.size;
      });
    },
    msgList(params) {
      return new Promise((resolve, reject) => {
        axios
          .post(api.MSG_TOP_TEN, { params })
          .then(
            response => {
              resolve(response.data);
            },
            err => {
              resolve(defaultValue.msgList);
            }
          )
          .catch(error => {
            resolve(defaultValue.msgList);
          });
      });
    },

    menuList(params) {
      return new Promise((resolve, reject) => {
        axios
          .get(api.SYS_MENU_LIST, { params })
          .then(
            response => {
              resolve(response.data);
            },
            err => {
              resolve(defaultValue.menuList);
            }
          )
          .catch(error => {
            resolve(defaultValue.menuList);
          });
      });
    },
    handleSizeChange(val) {
      //改变每页数量
      this.pageRow = val;
      this.listQuery.pageRow = val;
      this.getList();
      //this.handleFilter();
    },
    handleCurrentChange(val) {
      //改变页码
      this.pageNum = val;
      this.listQuery.pageNum = val;
      this.getList();
    },
    getIndex($index) {
      //表格序号
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1;
    },
    showCreate() {
      //显示新增对话框
      this.tempProduct.productName = "";
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
    showUpdate($index) {
      //显示修改对话框
      this.tempProduct.id = this.list[$index].id;
      this.tempProduct.productName = this.list[$index].productName;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    // isDelete($index) {
    //   //显示删除对话框
    //   this.tempProduct.id = this.list[$index].id;
    //   this.tempProduct.productName = this.list[$index].productName;
    //   this.dialogStatus = "delete";
    //   this.dialogFormVisible = true;
    // },
    createProduct() {
      //保存新商品
      this.api({
        url: "yun/product/add",
        method: "post",
        data: this.tempProduct
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false;
      });
    },
    updateProduct() {
      //修改商品信息
      this.api({
        url: "yun/product/update",
        method: "post",
        data: this.tempProduct
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false;
      });
    },
    isDelete($index) {
      this.tempProduct.id = this.list[$index].id;
      this.tempProduct.isDelete = this.list[$index].isDelete;
      //修改商品信息
      this.api({
        url: "yun/product/delete",
        method: "post",
        data: this.tempProduct
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false;
      });
    }
  }
};
</script>
