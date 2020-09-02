<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-button type="danger" icon="plus" v-if="hasPerm('yun:user:add')" @click="showCreate">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="list"
      v-loading.body="listLoading"
      element-loading-text="连接中"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="流水号" width="80">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"></span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="姓名" prop="realName" style="width: 58px;"></el-table-column>
      <el-table-column align="center" label="名称" prop="userName" style="width: 58px;"></el-table-column>
      <el-table-column align="center" label="系统角色" width="100">
        <template slot-scope="scope">
          <el-tag type="danger" v-text="scope.row.role.roleName" v-if="scope.row.role.id==1"></el-tag>
          <el-tag type="info" v-text="scope.row.role.roleName" v-else></el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="注册时间" prop="createTime" width="180"></el-table-column>
      <el-table-column align="center" label="编辑时间" prop="updateTime" width="180"></el-table-column>
      <el-table-column align="center" label="操作" width="220" v-if="hasPerm('yun:user:update')">
        <template slot-scope="scope">
          <el-button
            type="primary"
            icon="edit"
            @click="reg(scope.$index)"
            style="font-size: 9px;"
          >修改</el-button>
          <el-button
            type="danger"
            icon="delete"
            style="font-size: 9px;"
            v-if="scope.row.id!=userId "
            @click="delete(scope.$index)"
            plain
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageRow"
      :total="totalCount"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        class="small-space"
        :model="yunUser"
        label-position="left"
        label-width="80px"
        style="width: 300px; margin-left:50px;"
      >
        <el-form-item label="用户名" required v-if="dialogStatus=='add'">
          <el-input type="text" v-model="yunUser.userName"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="dialogStatus=='add'" required>
          <el-input type="password" v-model="yunUser.passWord"></el-input>
        </el-form-item>
        <el-form-item label="新密码" v-else>
          <el-input type="password" v-model="yunUser.passWord" placeholder="空白的话，原密码不变"></el-input>
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="yunUser.roleId" placeholder="请选择" value-key="id">
            <el-option v-for="item in roles" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="真实姓名" required>
          <el-input type="text" v-model="yunUser.realName"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='add'" type="success" @click="add">创 建</el-button>
        <el-button type="primary" v-else @click="reg">修 改</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      totalCount: 0, 
      list: [],  
      listLoading: false,  
      listQuery: {
        pageNum: 1, 
        pageRow: 10  
      },
      roles: [],  
      dialogStatus: "add",
      dialogFormVisible: false,
      textMap: {
        update: "修正",
        create: "注册"
      },
      yunUser: {
        userName: "",
        id: "",
        realName: "",
        roleId: "",
        userId: "",
        roleName: "",
        role: "",
        passWord: ""
      }
    };
  },
  created() {
    this.getList();
    if (this.hasPerm("yun:user:add") || this.hasPerm("yun:user:update")) {
      this.getAllRoles();
    }
  },
  computed: {
    ...mapGetters(["userId"])
  },
  methods: {
    getAllRoles() {
      this.api({
        url: "yun/user/getRolelist",
        method: "get"
      }).then(data => {
        this.roles = data;
      });
    },
    getList() {
 //Array老师提醒：这个相当于Ajax的功效，list
      this.listLoading = true;
      this.api({
        url: "yun/user/list",
        method: "get",
        params: this.listQuery
      }).then(data => {
        this.listLoading = false;
        this.list = data.records;
        this.totalCount = data.total;
      });
    },
    handleSizeChange(val) {
 
      this.listQuery.pageRow = val;
      this.handleFilter();
    },
    handleCurrentChange(val) {
      
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleFilter() {
     
      this.listQuery.pageNum = 1;
      this.getList();
    },
    getIndex($index) {
      ////Array老师提醒：流水号
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1;
    },
    showCreate() {
      //dialog
      this.yunUser.userName = "";
      this.yunUser.realName = "";
      this.yunUser.roleId = "";
      this.yunUser.userId = "";
      this.yunUser.passWord = "";
      this.yunUser.roleName = "";
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
    },
      reg($index) {
      let user = this.list[$index];
      this.yunUser.userName = user.userName;
      this.yunUser.realName = user.realName;

      this.yunUser.roleId = user.roleId;
      this.yunUser.userId = user.userId;
      this.yunUser.roleName = user.roleName;
      this.yunUser.isDelete = "0";
      this.yunUser.passWord = "";
      this.yunUser.id = user.id;
      this.dialogStatus = "reg";
      this.dialogFormVisible = true;
    },
    add() {
      //Array老师提醒：这个相当于Ajax的功效，add
      this.api({
        url: "yun/user/add",
        method: "post",
        data: this.yunUser
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false;
      });
    },
    up() {
     //Array老师提醒：这个相当于Ajax的功效，update
      let _vue = this;
      this.api({
        url: "yun/user/update",
        method: "post",
        data: this.yunUser
      }).then(() => {
        let msg = "修改成功";
        this.dialogFormVisible = false;
        if (this.userId === this.yunUser.userId) {
          msg = "修改成功,可以退出重新login刷新";
        }
        this.$message({
          message: msg,
          type: "success",
          duration: 1 * 1000,
          onClose: () => {
            _vue.getList();
          }
        });
      });
    },
    delete($index) {
      let _vue = this;
      this.$confirm("删除吗?", "提示", {
        confirmButtonText: "确定",
        showCancelButton: false,
        type: "warning"
      }).then(() => {
        let yunUser = _vue.list[$index];
        yunUser.isDelete = "1";
        _vue
          .api({
            url: "yun/user/delete",
            method: "post",
            data: yunUser
          })
          .then(() => {
            _vue.getList();
          })
          .catch(() => {
            _vue.$message.error("删除失败");
          });
      });
    }
  }
};
</script>
