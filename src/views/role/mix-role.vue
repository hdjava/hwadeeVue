<template>
  <div class="app-container">
    <div>
      <el-button type="info" @click="addRole" v-if="hasPerm('yun:role:add')">新增</el-button>
    </div>
    <el-table
      :data="list"
      v-loading.body="listLoading"
      element-loading-text="拼命加载中"
      border
      fit
      highlight-current-row
    >
      <!-- <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"></span>
        </template>
      </el-table-column>-->
      <el-table-column prop="roleName" label="角色名"></el-table-column>
      <el-table-column align="center" label="用户">
        <template slot-scope="scope">
          <div v-for="user in scope.row.yunUser">
            <div v-text="user.userName" style="display: inline-block;"></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="isDelete" label="状态" filter-placement="bottom-end">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isDelete === '0' ? 'primary' : 'danger'"
            disable-transitions
          >{{scope.row.isDelete=="0"?'启用':'禁用'}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" v-if="hasPerm('yun:role:update') ||hasPerm('yun:role:delete') ">
        <template slot-scope="scope">
          <el-button
            size="mini"
            :disabled="scope.row.name=='超级管理员'"
            @click="handleEdit(scope.$index, scope.row)"
            v-if="hasPerm('yun:role:update')"
          >编辑</el-button>
          <el-button
            size="mini"
            :disabled="scope.row.name=='超级管理员'"
            @click="roleEdit(scope.$index, scope.row)"
            v-if="hasPerm('yun:role:update') ||hasPerm('yun:role:delete') "
          >权限分配</el-button>
          <el-button
            size="mini"
            type="danger"
            :disabled="scope.row.name=='超级管理员'"
            @click="handleDelete(scope.$index, scope.row)"
            v-if="hasPerm('yun:role:delete')"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="角色信息" class="dialog1" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="角色名称" :label-width="formLabelWidth">
          <el-input v-model="form.roleName" maxlength="8" show-word-limit auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="是否开启" :label-width="formLabelWidth">
          <el-switch v-model="form.isDelete"></el-switch>
          <el-input v-model="form.id" placeholder hidden></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible=false">取 消</el-button>
        <el-button type="primary" @click="addRoleSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="权限分配选择"
      class="dialog2"
      @opened="setRoleData"
      :visible.sync="dialogFormVisible2"
    >
      <el-input placeholder="输入关键字进行过滤" v-model="filterText" style="margin-bottom: 20px"></el-input>
      <el-tree
        :data="roleTree"
        node-key="id"
        show-checkbox
        ref="permissionList"
        :filter-node-method="filterNode"
        :default-expand-all="true"
        :default-checked-keys="midPwList"
        :props="defaultProps"
      ></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="rolePermissionSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "roleManage",
  data() {
    return {
      list: [],
      setTree: [],
      allPermission: [],
      listLoading: false,
      dialogFormVisible: false,
      dialogFormVisible2: false,
      form: {
        roleName: "",
        isDelete: "0",
        permissionList: []
      },
      tempRole: {
        roleName: "",
        roleId: "",
        permissionList: []
      },
      formLabelWidth: "120px",
      defaultProps: {
        children: "permissionList",
        label: "menuName",
        id: "id"
      },
      midPwList: [],
      roleTree: {
        children: "",
        label: "",
        id: "",
        menuName: ""
      },
      selectData: [],
      selectRoleId: "",
      // selectData: {
      //   label: "",
      //   id: "",
      //   children: []
      // },
      filterText: "",
      checkedIds: []
    };
  },
  getIndex($index) {
    //序号
    return $index + 1;
  },
  methods: {
    handleEdit(index, row) {
      for (let item in row) {
        this.form[item] = row[item];
      }
      this.form.isDelete = row.isDelete === "启用" ? true : false;
      this.dialogFormVisible = true;
    },
    addRole() {
      this.form = {
        name: "",
        describe: "",
        status: true
      };
      this.dialogFormVisible = true;
    },
    addRoleSubmit() {
      let that = this;
      if (!this.form.roleName) {
        that.$message({
          showClose: true,
          message: "角色名称不能为空",
          type: "error"
        });
        return false;
      }
      this.api({
        url: "yun/role/add",
        method: "post",
        data: this.form
      })
        .then(res => {
          this.dialogFormVisible = false;
          this.getList();
          that.$message({
            showClose: true,
            message: res.data.msg,
            type: "success"
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    rolePermissionSubmit() {

      let that = this;

      let rolePermissionData = {
        ids: that.$refs.permissionList.getCheckedKeys(),
        roleId: that.selectRoleId
      };

      this.api({
        url: "yun/role/setMenus",
        method: "post",
        data: {
          ids: that.$refs.permissionList.getCheckedKeys(),
          roleId: that.selectRoleId
        }
      })
        .then(res => {
          let msg = "";
          if (res > 0) {
            msg = "执行成功！";
          }
          that.$message({
            showClose: true,
            message: msg,
            type: "success"
          });
          this.dialogFormVisible = false;
          this.dialogFormVisible2 = false;
          this.getList();
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 获得选中的节点的key
    checkedKeys: function(data) {
      alert(JSON.stringify(this.$refs.permissionList.getCheckedKeys()));
    },

    roleEdit(index, row) {
      //this.selectRoleId = row.yunMenusVo[index].id;
      this.selectRoleId = row.id;

      // this.selectData.label = row.yunMenusVo[index].menuName;
      // this.selectData.children = row.yunMenusVo[index].permissionList;
      //this.selectData = row.checkedIds;
      this.midPwList = row.checkedIds;
      this.$nextTick(() => {
        this.$refs.permissionList.setCheckedKeys([]);
        this.$refs.permissionList.setCheckedKeys(row.checkedIds);
      });
      this.dialogFormVisible2 = true;
    },

    setRoleData() {
      this.$nextTick(() => {
        this.$refs.permissionList.setCheckedKeys([]);
        this.$refs.permissionList.setCheckedKeys(this.midPwList);
      });
    },
    checkRequired(_perm, _index) {
      //选中之后触发
      let permId = _perm.id;
      if (this.tempRole.permissionList.indexOf(permId) > -1) {
        //选中事件
        this.makeReuqiredPermissionChecked(_index);
      } else {
        //取消选中事件
        if (_perm.requiredPermission == true) {

          this.noPerm(_index);
        }
      }
    },
    handleDelete(index, row) {
      let that = this;

      this.api({
        url: "yun/role/delete",
        method: "post",
        data: { yunRole: row.id }
      })
        .then(() => {
          this.getList();
        })
        .catch(() => {
          this.$message.error("删除失败");
        });
    },

    getAllPermisson() {
      //查询
      this.api({
        url: "yun/role/getAlllist",
        method: "get"
      }).then(data => {
        this.roleTree = data;
        this.allPermission = data;
        this.setTree = data;
      });
    },
    getList() {
      let that = this;
      this.api({
        url: "yun/role/list",
        method: "get"
      })
        .then(
          response => {
            this.listLoading = false;
            this.list = response.list;
            this.checkedIds = response.list[0].checkedIds;

            this.$refs.permissionList[0].setCheckedKeys(checkedIds);
          },
          function(response) {
            this.list = response;
            for (let i = 0; i < response.data.rows.length; i++) {
              if (response.data.rows[i].isDelete) {
                response.data.rows[i].isDelete = "启用";
              } else {
                response.data.rows[i].isDelete = "禁用";
              }
            }
            that.list = response.data;
          }
        )
        .catch(function(error) {
          console.log(error);
        });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.menuName.indexOf(value) !== -1;
    }
  },
  watch: {
    filterText(val) {
      this.$refs.permission.filter(val);
    }
  },
  // computed: {
  //   roleTree: function() {
  //     let addRouters = this.$store.getters.addRouters;
  //     for (let i = 0; i < addRouters.length; i++) {
  //       if (addRouters[i].redirect === "/404") {
  //         addRouters.splice(i, 1);
  //       }
  //     }
  //     return addRouters;
  //   }
  // },
  mounted() {
    this.getList();
    this.getAllPermisson();
  }
};
</script>

<style scoped>
.requiredPerm {
  color: #ff0e13;
}
</style>
