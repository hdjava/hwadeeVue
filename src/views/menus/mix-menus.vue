<template>
  <imp-panel>
    <h3 class="box-title" slot="header" style="width: 100%;">
      <el-button type="info" icon="plus" @click="newAdd" v-if="hasPerm('yun:menus:add')">新增</el-button>
      <el-button
        type="danger"
        icon="delete"
        @click="batchDelete"
        v-if="hasPerm('yun:menus:delete')"
      >删除</el-button>
    </h3>
    <el-row slot="body" :gutter="24" style="margin-bottom: 20px;">
      <el-col :span="6" :xs="24" :sm="24" :md="6" :lg="6" style="margin-bottom: 20px;">//布局
        <el-tree
          v-if="menuTree"
          ref="menuTree"//给menuTree注册组件信息
          :data="menuTree"
          show-checkbox
          highlight-current
          :render-content="renderContent"//自定义样式
          @node-click="handleNodeClick"
          clearable//显示清除按钮
          node-key="id"
          :props="defaultProps"
        ></el-tree>
      </el-col>
      <el-col :span="18" :xs="24" :sm="24" :md="18" :lg="18">
        <el-card class="box-card">
          <div class="text item">
            <el-form :model="form" ref="form">
              <el-form-item label="父级" :label-width="formLabelWidth">
                <!--<el-input v-model="form.parentId" auto-complete="off"></el-input>-->
                <el-select-tree
                  v-model="form.parentId"
                  :treeData="menuTree"
                  :propNames="defaultProps"
                  clearable
                  placeholder="请选择父级"
                ></el-select-tree>
              </el-form-item>
              <el-form-item label="权限名称" :label-width="formLabelWidth">
                <el-input v-if="form.parentId==0" v-model="form.menuName" auto-complete="off"></el-input>
                <el-input
                  v-else="form.parentId!=0"
                  v-model="form.permissionName"
                  auto-complete="off"
                ></el-input>
              </el-form-item>
              <el-form-item label="链接" :label-width="formLabelWidth">
                <el-input v-model="form.href" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item label="权限代码" :label-width="formLabelWidth">
                <el-input v-model="form.permissionCode" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item label="是否显示" :label-width="formLabelWidth">
                <el-radio class="radio" v-model="form.isOn" label="1">显示</el-radio>
                <el-radio class="radio" v-model="form.isOn" label="0">不显示</el-radio>
              </el-form-item>

              <el-form-item label="排序" :label-width="formLabelWidth">
                <el-slider v-model="form.sort"></el-slider>
              </el-form-item>
              <el-form-item label :label-width="formLabelWidth">
                <el-button
                  type="info"
                  @click="onSubmit"
                  v-show="form.id==null&&hasPerm('yun:menus:add')"
                >新增</el-button>
                <el-button
                  type="primary"
                  @click="onSubmit"
                  v-show="form.id!=null && hasPerm('yun:menus:update')"
                >修改</el-button>

                <el-button
                  type="danger"
                  @click="deleteSelected"
                  icon="delete"
                  v-show="form.id && form.id!=null"
                  v-if="hasPerm('yun:menus:delete')"
                >删除</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-dialog title="选择图标" v-model="selectIconDialog" size="tiny">
            <div class="select-tree">
              <el-scrollbar
                tag="div"
                class="is-empty"
                wrap-class="el-select-dropdown__wrap"
                view-class="el-select-dropdown__list"
              >
                <div class="icons-wrapper">
                  <i class="fa fa-address-book" @click="selectIcon($event)"></i>
                  <i class="fa fa-address-book-o" @click="selectIcon($event)"></i>
                  <i class="fa fa-address-card" @click="selectIcon($event)"></i>
                  <i class="fa fa-address-card-o" @click="selectIcon($event)"></i>
                  <i class="fa fa-adjust" @click="selectIcon($event)"></i>
                  <i class="fa fa-wrench" @click="selectIcon($event)"></i>
                </div>
              </el-scrollbar>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button @click="selectIconDialog = false">取 消</el-button>
              <el-button type="primary" @click="selectIconDialog = false">确 定</el-button>
            </span>
          </el-dialog>
        </el-card>
      </el-col>
    </el-row>
  </imp-panel>
</template>
<script type="text/babel">
import panel from "@/components/Menus/panel";
import selectTree from "@/components/Menus/selectTree";
import treeter from "@/components/Menus/treeter";
import merge from "element-ui/src/utils/merge";

export default {
  mixins: [treeter],
  components: {
    "imp-panel": panel,
    "el-select-tree": selectTree
  },
  data() {
    return {
      selectIconDialog: false,
      formLabelWidth: "100px",
      defaultProps: {
        children: "children",
        label: "menuName",
        id: "id",
        parentId: "parentId",
        permissionName: "permissionName",
        permissionCode: ""
      },
      maxId: 7000000,
      menuTree: [],//数据
      form: {
        id: null,
        menuName: "",
        permissionName: "",
        permissionCode: "",
        sort: 0,
        icon: "",
        href: "",
        isOn: "",
        delivery: false,
        parentId: null,
        desc: ""
      }
    };
  },
  methods: {
    getList() {
      //查询列表
      if (!this.hasPerm("yun:menus:list")) {
        return;
      }
      this.listLoading = true;
      this.api({
        url: "yun/menus/list",
        method: "get"
      }).then(data => {
        this.listLoading = false;
        this.menuTree = data.menusMap;
        //alert(JSON.stringify(data.menusMap))
      });
    },
    selectIcon(event) {
      this.form.icon = event.target.className;
      this.selectIconDialog = false;
    },
    renderContent(h, { node, data, store }) {
      if (data.parentId == 0) {
        return (
          <span>
            <span>
              <span>
                <i class={data.icon}></i>&nbsp;{data.menuName}
              </span>
            </span>
          </span>
        );
      } else {
        return (
          <span>
            <span>
              <span>
                <i class={data.icon}></i>&nbsp;{data.permissionName} (
                {data.permissionCode})
              </span>
            </span>
          </span>
        );
      }

      // console.log(node)
      // console.log(data)
    },
    // renderContent(h) {
    //    return (
    //     <span>
    //         abc
    //     </span>);
    // },
    newAdd() {
      this.form = {
        id: null,
        menuName: "",
        sort: 0,
        permissionName: "",
        permissionCode: "",
        icon: "",
        href: "",
        isOn: "",
        delivery: false,
        parentId: null,
        desc: ""
      };
    },
    deleteSelected() {
      this.api({
        url: "yun/menus/update",
        method: "get",
        params: this.form.id
      })
        .then(res => {
          this.$message("操作成功");
          this.deleteFromTree(this.menuTree, this.form.id);
          this.newAdd();
        })
        .catch(e => {
          this.$message("操作成功");
          this.deleteFromTree(this.menuTree, this.form.id);
          this.newAdd();
        });
    },
    batchDelete() {
      var ids = this.$refs.menuTree.getCheckedKeys();
      if (ids == null || ids.length <= 0) {
        this.$message.warning("请选择要删除的资源");
        return;
      }
      this.$confirm("确定删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.api({
          url: "yun/menus/delete",
          method: "get",
          params: { ids: ids.join(",") }
        })
          .then(res => {
            this.$message("操作成功");
            this.load();
          })
          .catch(e => {
            this.$message("操作成功");
            this.batchDeleteFromTree(this.menuTree, ids);
          });
      });
    },
    handleNodeClick(data) {
      //console.log(merge({}, data))
      this.form = merge({}, data);
    },
    onSubmit() {
      if (this.form.id == null) {
        this.api({
          url: "yun/menus/add",
          method: "get",
          params: this.form
        })
          .then(res => {
            this.$message("操作成功");
            this.form.id = res.data.id;
            this.appendTreeNode(this.menuTree, res.data);
          })
          .catch(e => {
            this.maxId += 1;
            this.$message("操作成功");
            this.form.id = this.maxId;
            var ddd = {
              id: this.form.id,
              menuName: this.form.menuName,
              sort: this.form.sort,
              icon: this.form.icon,
              href: this.form.href,
              isOn: this.form.isOn,
              delivery: this.form.delivery,
              parentId: this.form.parentId,
              permissionName: this.form.permissionName,
              permissionCode: this.form.permissionCode,
              desc: this.form.desc,
              children: []
            };
            this.appendTreeNode(this.menuTree, ddd);
            this.menuTree.push({});
            this.menuTree.pop();
          });
      } else {
        this.api({
          url: "yun/menus/update",
          method: "get",
          params: this.form
        })
          .then(res => {
            this.$message("操作成功");
            this.updateTreeNode(this.menuTree, res.data);
          })
          .catch(e => {
            this.$message("操作成功");
            this.updateTreeNode(this.menuTree, merge({}, this.form));
          });
      }
    },
    load() {
      // sysApi.menuList().then(res => {
      //   this.menuTree = res;
      // })
      this.getList();
    }
  },
  created() {
    this.load();
  }
};
</script>

<style>
.select-tree .icons-wrapper {
  display: block;
}

.select-tree .is-empty i {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  display: inline-block;
  cursor: pointer;
}

.select-tree .is-empty i:hover {
  background-color: #0d6aad;
  color: #ffffff;
}
</style>
