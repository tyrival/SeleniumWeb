<template>
  <div>
    <!-- 操作栏 -->
    <div class="toolbar">
      <el-row :gutter="20">
        <el-col :span="20" :offset="1">
          <el-button size="small" @click="openModalSystem(modalSystem.status.CREATE)">新增系统</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="source-panel">
      <template v-for="(sys, i) in system">
        <el-col class="card-space" :span="8">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span><strong>{{ sys.comment }}</strong></span>
              <el-button type="text" size="mini" style="float:none" class="el-icon el-icon-edit-outline"
                         @click="openModalSystem(modalSystem.status.EDIT, sys)">
              </el-button>
              <el-button type="primary" round size="mini" @click="openModalSource(sys)">脚本</el-button>
              <el-button type="primary" round size="mini" @click="openModalTask(sys)">用例</el-button>
            </div>
            <div class="text item">名称：{{ sys.name }}</div>
            <div class="text item">URL：{{ sys.url }}
            </div>
          </el-card>
        </el-col>
      </template>

      <!-- 系统详情弹窗 -->
      <el-dialog
        width="75%"
        top="5vh"
        :title="modalSystem.currentStatus == modalSystem.status.CREATE ? '新增系统' : modalSystem.system.comment"
        :visible.sync="modalSystem.visible"
        :before-close="onCloseModalSystem">
        <el-form :model="modalSystem.system"
                 :rules="modalSystem.rules"
                 ref="modalSystemForm"
                 label-width="100px"
                 size="small">
          <el-col :span="8">
            <el-form-item label="名称" prop="name">
              <el-input v-if="modalSystem.currentStatus !== modalSystem.status.INFO"
                        v-model="modalSystem.system.name"></el-input>
              <span v-else>: {{ modalSystem.system.name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="说明" prop="comment">
              <el-input v-if="modalSystem.currentStatus !== modalSystem.status.INFO"
                        v-model="modalSystem.system.comment"></el-input>
              <span v-else>: {{ modalSystem.system.comment }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="URL" prop="url">
              <el-input v-if="modalSystem.currentStatus !== modalSystem.status.INFO"
                        v-model="modalSystem.system.url"></el-input>
              <span v-else>: {{ modalSystem.system.url }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="依赖包">
              <el-input type="textarea"
                        v-if="modalSystem.currentStatus !== modalSystem.status.INFO"
                        :autosize="{ minRows: 3, maxRows: 5}"
                        v-model="modalSystem.system.jars"></el-input>
              <span v-else>: {{ modalSystem.system.jars }}</span>
            </el-form-item>
          </el-col>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small"
                     v-if="modalCode.currentStatus == modalCode.status.INFO"
                     @click="closeModalSystem">关 闭</el-button>
          <el-button size="small"
                     v-if="modalCode.currentStatus !== modalCode.status.INFO"
                     @click="closeModalSystem">取 消</el-button>
          <el-button size="small"
                     type="primary"
                     v-if="modalCode.currentStatus !== modalCode.status.INFO"
                     @click="saveSystem">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 任务列表弹窗 -->
      <el-dialog
        width="80%"
        top="5vh"
        :title="modalTask.comment"
        :visible.sync="modalTask.visible"
        :before-close="onCloseModalTask">
        <el-form :inline="true"
                 label-width="80px"
                 size="small">
          <el-form-item>
            <el-button @click="modalTaskAddRow">添加用例</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="modalTask.tasks"
                  ref="modalTaskTable"
                  size="mini"
                  max-height="450">
          <el-table-column align="center"
                           type="expand"
                           label="步骤"
                           min-width="150">
            <template slot-scope="scope">
              <el-form label-position="left" :inline="true" class="source-table-expand-step">
                <el-col :span="21">
                  <el-form-item>
                    <el-button size="small"
                               class="source-add-step"
                               @click="modalTaskAddStep(scope.row)">增加一步
                    </el-button>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item v-if="taskModified(scope)">
                    <el-button size="small"
                               class="source-save-step"
                               @click="modalTaskResetStep(scope)">重 置
                    </el-button>
                  </el-form-item>
                </el-col>
                <template v-for="(step, i) in scope.row.steps">
                  <el-col :span="24">
                    <el-form-item label="类名">
                      <el-input v-model="step.module"
                                size="small">
                      </el-input>
                    </el-form-item>
                    <el-form-item label="方法名">
                      <el-input v-model="step.method"
                                size="small">
                      </el-input>
                    </el-form-item>
                    <el-form-item label="参数">
                      <el-input :value="formatArrayToString(scope.row.params[i])"
                                @blur="onBlurParam($event, scope, i)"
                                size="small">
                      </el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="text" size="small" class="el-icon-close"
                                 @click="modalTaskDeleteStep(scope.row, i)"></el-button>
                    </el-form-item>
                  </el-col>
                </template>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column label="名称"
                           min-width="100">
            <template slot-scope="scope">
              <el-input size="small"
                        v-if="modalTask.editRows[scope.$index]"
                        v-model="scope.row.name"
                        placeholder="请输入用例说明"></el-input>
              <p v-else>{{ scope.row.name }}</p>
            </template>
          </el-table-column>
          <el-table-column label="说明"
                           min-width="200">
            <template slot-scope="scope">
              <el-input v-model="scope.row.comment"
                        size="small"
                        v-if="modalTask.editRows[scope.$index]"
                        placeholder="请输入用例说明"></el-input>
              <p v-else>{{ scope.row.comment }}</p>
            </template>
          </el-table-column>
          <el-table-column align="center"
                           min-width="100">
            <template slot-scope="scope">
              <el-button type="text"
                         v-show="!modalTask.editRows[scope.$index]"
                         @click="modalTaskRowEdit(scope.$index)">编辑
              </el-button>
              <el-button size="mini"
                         v-show="modalTask.editRows[scope.$index]"
                         @click="modalTaskRowEdit(scope.$index)">确定
              </el-button>
              <el-button size="mini"
                         type="text"
                         @click="modalTaskRowDelete(scope.$index)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeModalTask">取 消</el-button>
          <el-button size="small"
                     type="primary"
                     @click="modalTaskSaveTask">保 存</el-button>
        </span>
      </el-dialog>

      <!-- 脚本列表弹窗 -->
      <el-dialog
        width="60%"
        top="5vh"
        :title="modalSource.comment"
        :visible.sync="modalSource.visible"
        :before-close="onCloseModalSource">
        <el-form :inline="true"
                 label-width="100px"
                 size="small">
          <el-form-item>
            <el-button @click="openModalCode(modalCode.status.CREATE)">添加脚本
            </el-button>
          </el-form-item>
        </el-form>
        <el-table :data="modalSource.sources"
                  size="mini"
                  max-height="450"
                  :show-header="false">
          <el-table-column align="center"
                           prop="name"
                           label="脚本名"
                           min-width="150">
          </el-table-column>
          <el-table-column align="center"
                           min-width="150">
            <template slot-scope="scope">
              <el-button type="text"
                         @click="openModalCode(modalCode.status.EDIT, scope.row.name)">编辑
              </el-button>
              <el-button type="text"
                         @click="openModalCode(modalCode.status.INFO, scope.row.name)">详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <span class="text-danger float-left">如需删除脚本，请远程登陆服务器后手工删除</span>
          <el-button size="small" @click="closeModalSource">关 闭</el-button>
        </span>
      </el-dialog>

      <!-- 脚本详情弹窗 -->
      <el-dialog
        width="85%"
        top="5vh"
        :title="modalCode.currentStatus"
        :visible.sync="modalCode.visible"
        :before-close="onCloseModalCode">
        <el-form :inline="true"
                 :model="modalCode.source"
                 :rules="modalCode.rules"
                 label-width="100px"
                 size="small">
          <el-col :span="12">
            <el-form-item label="系统">
              <span>: {{ modalCode.source.systemComment }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="脚本" prop="name">
              <el-input v-if="modalCode.currentStatus !== modalCode.status.INFO"
                        v-model="modalCode.source.name"
                        placeholder="请输入脚本名"></el-input>
              <span v-else>: {{ modalCode.source.name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-input type="textarea"
                      :readonly="modalCode.currentStatus == modalCode.status.INFO"
                      :autosize="{ minRows: 10, maxRows: 22}"
                      v-model="modalCode.source.code"
                      placeholder="脚本源码">
            </el-input>
          </el-col>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" class="float-left" @click="clipboardCode">复制源码</el-button>
          <el-button size="small"
                     v-if="modalCode.currentStatus == modalCode.status.INFO"
                     @click="closeModalCode">关 闭</el-button>
          <el-button size="small"
                     v-if="modalCode.currentStatus !== modalCode.status.INFO"
                     @click="closeModalCode">取 消</el-button>
          <el-button size="small"
                     type="primary"
                     v-if="modalCode.currentStatus !== modalCode.status.INFO"
                     @click="saveSource">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import clipboard from 'clipboard-polyfill'

  export default {
    data() {
      return {
        system: [],
        sources: {},
        modalSystem: {
          visible: false,
          status: {
            CREATE: "新增",
            EDIT: "编辑",
            INFO: "详情"
          },
          currentStatus: null,
          rules: {
            name: [
              {required: true, message: '请填写系统名称', trigger: 'blur'},
            ],
            comment: [
              {required: true, message: '请填写系统说明', trigger: 'blur'},
            ],
            url: [
              {required: true, message: '请填写URL', trigger: 'blur'},
            ]
          },
          system: {}
        },
        modalTask: {
          visible: false,
          name: null,
          comment: null,
          editRows: [],
          tasks: []
        },
        modalSource: {
          visible: false,
          name: null,
          comment: null,
          sources: []
        },
        modalCode: {
          status: {
            CREATE: "新增",
            EDIT: "编辑",
            INFO: "详情"
          },
          visible: false,
          currentStatus: null,
          source: {name: null, system: null, code: null},
          rules: {
            name: [
              {required: true, message: '请输入脚本名', trigger: 'blur'},
            ]
          },
        }
      }
    },
    mounted() {
      this.load()
    },
    methods: {
      load() {
        this.initSystem()
      },
      initSystem() {
        // 获取系统列表
        this.$ajax({
          method: 'POST',
          url: '/test/system/list',
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.system = result.data
            this.initSource()
          } else {
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })
      },
      initSource() {
        if (!this.system || !this.system.length) {
          return
        }
        var reqArray = []
        for (var i = 0; i < this.system.length; i++) {
          var sys = this.system[i];
          reqArray.push(this.$ajax.post('/test/source/list?system=' + sys.name))
        }
        var me = this
        me.$ajax.all(reqArray)
          .then(me.$ajax.spread(function () {
            if (!arguments || !arguments.length) {
              return
            }
            for (var x = 0; x < arguments.length; x++) {
              var result = arguments[x].data
              if (result.success) {
                var data = result.data
                if (!data || !data.length) {
                  continue
                }
                var sysName = data[0].system
                me.sources[sysName] = data
              }
            }
            me.initModalSource()
          }))
          .catch(error => {
          })
      },
      initModalSource() {
        if (!this.system || !this.system.length || !this.modalSource.name) {
          return
        }
        for (var i = 0; i < this.system.length; i++) {
          var sys = this.system[i];
          if (sys.name == this.modalSource.name) {
            this.initModalSourceData(sys)
            this.initModalCode()
            return
          }
        }
      },
      initModalCode() {
        if (!this.modalSource.sources || !this.modalSource.sources.length || !this.modalCode.name) {
          return
        }
        for (var i = 0; i < this.modalSource.sources.length; i++) {
          var source = this.modalSource.sources[i];
          if (source.name = this.modalCode.name) {
            this.initModalCodeData()
            return
          }
        }
      },

      /* ==================== 系统详情弹窗 ==================== */
      /**
       * 打开系统编辑弹窗
       */
      openModalSystem(status, system) {
        this.initModalSystemData(system)
        this.modalSystem.currentStatus = status
        this.modalSystem.visible = true
      },
      /**
       * 初始化系统编辑数据
       */
      initModalSystemData(system) {
        if (!system) {
          return
        }
        this.modalSystem.system.nameBak = system.name
        this.modalSystem.system.name = system.name
        this.modalSystem.system.comment = system.comment
        this.modalSystem.system.url = system.url
        this.modalSystem.system.jars = this.formatArrayToString(system.jars)
      },
      /**
       * 保存系统信息
       */
      saveSystem() {
        this.$refs.modalSystemForm.validate((pass) => {
          if (!pass) {
            return
          }
          var origName = this.modalSystem.system.nameBak
          if (!origName) {
            var sys = {
              name: this.modalSystem.system.name,
              comment: this.modalSystem.system.comment,
              url: this.modalSystem.system.url,
              jars: this.formatStringToArray(this.modalSystem.system.jars)
            }
            this.system.push(sys)
          } else {
            for (var i = 0; i < this.system.length; i++) {
              var sys = this.system[i];
              if (sys.name == origName) {
                sys.name = this.modalSystem.system.name
                sys.url = this.modalSystem.system.url
                sys.comment = this.modalSystem.system.comment
                sys.jars = this.formatStringToArray(this.modalSystem.system.jars)
                break
              }
            }
          }
          this.saveSystemRequest()
        })
      },
      /**
       * 保存系统信息请求
       */
      saveSystemRequest() {
        this.$ajax({
          method: 'POST',
          url: '/test/system/save',
          data: {
            system: JSON.stringify(this.system)
          }
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.initSystem()
            this.closeModalSystem()
          } else {
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })
      },
      /**
       * 关闭系统编辑弹窗
       */
      closeModalSystem() {
        this.resetModalSystemData()
        this.modalSystem.visible = false
      },
      /**
       * 重置系统编辑数据
       */
      resetModalSystemData() {
        this.modalSystem.system.name = null
        this.modalSystem.system.nameBak = null
        this.modalSystem.system.comment = null
        this.modalSystem.system.url = null
        this.modalSystem.system.jars = null
      },
      /**
       * 关闭系统编辑弹窗
       */
      onCloseModalSystem(done) {
        this.closeModalSystem()
        done()
      },
      /**
       * 数组转字符串
       */
      formatArrayToString(array) {
        if (!array || !array.length) {
          return ''
        }
        return array.join(",")
      },
      /**
       * 数组转字符串
       */
      formatStringToArray(str) {
        if (!str) {
          return
        }
        var array = str.split(",")
        if (!array || !array.length) {
          return []
        }
        return array
      },

      /* ==================== 任务列表弹窗 ==================== */
      /**
       * 打开任务列表弹窗
       */
      openModalTask(system) {
        this.initModalTaskData(system)
        this.modalTask.visible = true
      },
      /**
       * 初始化脚本列表数据
       */
      initModalTaskData(system) {
        this.modalTask.name = system.name
        this.modalTask.comment = system.comment
        this.modalTask.tasks = JSON.parse(JSON.stringify(system.tasks))
        this.modalTask.editRows = []
        if (this.modalTask.tasks && this.modalTask.tasks.length) {
          for (var i = 0; i < this.modalTask.tasks.length; i++) {
            this.modalTask.editRows.push(false)
          }
        }
      },
      /**
       * 初始化脚本列表数据
       */
      taskModified(scope) {
        var sysName = this.modalTask.name
        for (var i = 0; i < this.system.length; i++) {
          var sys = this.system[i];
          if (sys.name == sysName) {
            var task = sys.tasks[scope.$index]
            var newTask = scope.row
            return !this.equalObject(task, newTask, true)
          }
        }
      },
      /**
       * 关闭任务列表弹窗
       */
      closeModalTask() {
        this.modalTask.visible = false
      },
      /**
       * 关闭任务列表弹窗
       */
      onCloseModalTask(done) {
        this.closeModalTask()
        done()
      },
      /**
       * 保存任务
       */
      modalTaskSaveTask() {
        var sysList = this.system
        if (!sysList || !sysList.length) {
          this.$message.error("未找到该任务所属的系统")
          return
        }
        for (var i = 0; i < sysList.length; i++) {
          var sys = sysList[i];
          if (sys.name == this.modalTask.name) {
            sys.tasks = JSON.parse(JSON.stringify(this.modalTask.tasks))
            break
          }
        }
        this.saveSystemRequest()
        this.closeModalTask()
      },
      /**
       * 增加Task
       */
      modalTaskAddRow() {
        this.modalTask.tasks.push({
          comment: '',
          name: '',
          params: [],
          steps: []
        })
        this.modalTask.editRows.push(true)
        this.$refs.modalTaskTable.doLayout()
      },
      /**
       * 编辑Task
       */
      modalTaskRowEdit(index) {
        this.modalTask.editRows[index] = !this.modalTask.editRows[index]
        this.$refs.modalTaskTable.doLayout()
      },
      /**
       * 删除Task
       */
      modalTaskRowDelete(index) {
        this.modalTask.tasks.splice(index, 1)
        this.$refs.modalTaskTable.doLayout()
      },
      /**
       * 重置步骤
       */
      modalTaskResetStep(scope) {
        var sysName = this.modalTask.name
        for (var i = 0; i < this.system.length; i++) {
          var sys = this.system[i];
          if (sys.name == sysName) {
            if (sys.tasks[scope.$index]) {
              this.modalTask.tasks[scope.$index] = JSON.parse(JSON.stringify(sys.tasks[scope.$index]))
              this.$refs.modalTaskTable.doLayout()
            } else {
              this.modalTask.tasks[scope.$index].steps = []
              this.modalTask.tasks[scope.$index].params = []
              this.$refs.modalTaskTable.doLayout()
            }
            return
          }
        }
      },
      // TODO
      /**
       * 增加步骤
       */
      modalTaskAddStep(row) {
        if (!row.steps) {
          row.steps = []
        }
        row.steps.push({
          module: null,
          method: null
        })
        if (!row.params) {
          row.params = []
        }
        row.params.push([])
      },
      /**
       * 删除步骤
       */
      modalTaskDeleteStep(row, index) {
        row.steps.splice(index, 1)
        row.params.splice(index, 1)
      },
      /**
       * 格式化参数字符串到数组
       */
      onBlurParam(event, scope, index) {
        var param = this.formatStringToArray(event.currentTarget.value)
        scope.row.params[index] = param
      },
      /* ==================== 脚本列表弹窗 ==================== */
      /**
       * 打开脚本列表弹窗
       */
      openModalSource(system) {
        this.initModalSourceData(system)
        this.modalSource.visible = true
      },
      /**
       * 初始化脚本列表数据
       */
      initModalSourceData(system) {
        this.modalSource.name = system.name
        this.modalSource.comment = system.comment
        this.modalSource.sources = this.sources[system.name]
      },
      /**
       * 关闭脚本列表弹窗
       */
      closeModalSource() {
        this.resetModalSourceData()
        this.modalSource.visible = false
      },
      /**
       * 重置脚本列表数据
       */
      resetModalSourceData() {
        this.modalSource.name = null
        this.modalSource.comment = null
        this.modalSource.sources = null
      },
      /**
       * 关闭脚本列表弹窗
       */
      onCloseModalSource(done) {
        this.closeModalSource()
        done()
      },

      /* ==================== 脚本编辑弹窗 ==================== */
      /**
       * 打开源码编辑弹窗
       */
      openModalCode(status, name) {
        this.initModalCodeData(name)
        this.modalCode.currentStatus = status
        this.modalCode.visible = true
      },
      /**
       * 初始化脚本详情数据
       */
      initModalCodeData(name) {

        this.$ajax({
          method: 'POST',
          url: '/test/source/get?system=' + this.modalSource.name + "&name=" + name,
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.modalCode.source.code = result.data
            this.modalCode.source.codeBak = result.data
          } else {
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })
        this.modalCode.currentStatus = status
        this.modalCode.source.system = this.modalSource.name
        this.modalCode.source.systemComment = this.modalSource.comment
        this.modalCode.source.name = name
        this.modalCode.source.nameBak = name
      },
      /**
       * 保存脚本
       */
      saveSource() {
        var system = this.modalCode.source.system
        var name = this.modalCode.source.name
        var oldName = this.modalCode.source.nameBak
        var code = this.modalCode.source.code
        if (name == this.modalCode.source.nameBak && code == this.modalCode.source.codeBak) {
          this.modalCode.visible = false
          return
        }
        if (oldName != name) {
          for (var i = 0; i < this.system.length; i++) {
            var sys = this.system[i];
            if (sys.name == system) {
              var sources = this.sources[system]
              if (sources && sources.length) {
                for (var j = 0; j < sources.length; j++) {
                  var source = sources[j];
                  if (source.name == name) {
                    this.$message.error("已存在同名脚本 " + name + "，请重新命名后保存。")
                    return
                  }
                }
              }
            }
          }
        }
        code = this.encodeParam(code);
        this.$ajax({
          method: 'POST',
          url: '/test/source/save?system=' + system + "&name=" + name + "&code=" + code + "&oldName=" + oldName,
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.load()
            this.$message({
              message: '脚本保存成功',
              type: 'success'
            });
            this.closeModalCode()
          } else {
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })
      },
      /**
       * 编码
       */
      encodeParam(param) {
        var str = param.replace(/%/g, '%25')
          .replace(/\+/g, '%2B')
          .replace(/#/g, '%23')
          .replace(/&/g, '%26')
          .replace(/=/g, '%3D')
          .replace(/\n\r?/g, '%0D%0A%0A')
        return str
      },
      /**
       * 关闭详情弹窗
       */
      closeModalCode() {
        this.resetModalCodeData()
        this.modalCode.visible = false
      },
      /**
       * 重置脚本列表数据
       */
      resetModalCodeData() {
        this.modalCode.currentStatus = null
        this.modalCode.source.system = null
        this.modalCode.source.systemComment = null
        this.modalCode.source.name = null
        this.modalCode.source.nameBak = null
      },
      /**
       * 关闭详情弹窗
       */
      onCloseModalCode(done) {
        this.closeModalCode()
        done()
      },
      /**
       * 复制源码
       */
      clipboardCode() {
        clipboard.writeText(this.modalCode.source.code)
        this.$message({
          message: '源码已复制到剪贴板',
          type: 'success'
        });
      },

      /* ==================== 脚本编辑弹窗 ==================== */
      /**
       * 比较两个对象是否相同
       */
      equalObject(obj1, obj2, deepCheck) {
        if (obj1 === obj2) {
          return true;
        }
        // 属性总数不等，直接返回false
        var size1 = 0;
        for (var key in obj1) {
          size1++;
        }
        var size2 = 0;
        for (var key in obj2) {
          size2++;
        }
        if (size1 !== size2) {
          return false;
        }

        if (!deepCheck) { // 浅度判断
          for (var key in obj1) {
            if (obj1[key] !== obj2[key]) {
              return false;
            }
            ;
          }
          return true;
        }
        var type1, type2;
        for (var key in obj1) {
          type1 = this.type(obj1[key]);
          type2 = this.type(obj2[key]);
          if (type1 !== type2) {
            return false;
          }
          if (type1 === "Object") {
            if (!this.equalObject(obj1[key], obj2[key], true)) {
              return false;
            }
          } else if (type1 === "Array") {
            if (!this.equalArray(obj1[key], obj2[key], true)) {
              return false;
            }
          } else if (obj1[key] !== obj2[key]) {
            return false;
          }
        }
        return true;
      },
      /**
       * 判断两个数组是否相等
       * 浅度相等：两数组toString一样
       * 深度相等的判断规则：
       *   1.长度相等
       *   2.俩数组的每一项：
       *      若为数组：参考本函数规则。
       *      若为对象：参考equalObject的规则。
       *      其他的数据类型，要求===判断为true
       * @param  {[type]} arr1
       * @param  {[type]} arr2
       * @param  {[type]} deepCheck
       * @return {[type]}
       */
      equalArray(arr1, arr2, deepCheck) {
        if (arr1 === arr2) {
          return true;
        }
        // 长度不等，不用继续判断
        if (arr1.length !== arr2.length) {
          return false;
        }
        // 浅度检查
        if (!deepCheck) {
          return arr1.toString() === arr2.toString();
        }
        // 判断每个基本数据类型是否一样
        var type1, type2; // 数组每一项的数据类型
        for (var i = 0; i < arr1.length; i++) {
          type1 = this.type(arr1[i]);
          type2 = this.type(arr2[i]);

          // 数据类型不一样，无需判断
          if (type1 !== type2) {
            return false;
          }
          if (type1 === "Array") {
            if (!this.equalArray(arr1[i], arr2[i], true)) {
              return false;
            }
          } else if (type1 === 'Object') {
            if (!this.equalObject(arr1[i], arr2[i], true)) {
              return false;
            }
          } else if (arr1[i] !== arr2[i]) {
            return false;
          }
        }
        return true;
      },
      /**
       * 对比两个function是否一样
       * 主要对比两者toString是否一样，
       * 对比会去掉函数名进行对比，其它哪怕差个回车都会返回false
       *
       * @param  {[type]} fn1
       * @param  {[type]} fn2
       * @return {[type]}
       */
      equalFunction(fn1, fn2) {
        var type1 = this.type(fn1),
          type2 = this.type(fn2);
        if (type1 !== type2 || type1 !== 'Function') {
          return false;
        }
        if (fn1 === fn2) {
          return true;
        }
        var reg = /^function[\s]*?([\w]*?)\([^\)]*?\){/;
        var str1 = fn1.toString().replace(reg, function ($, $1) {
          return $.replace($1, "");
        });
        var str2 = fn2.toString().replace(reg, function ($, $1) {
          return $.replace($1, "");
        })
        console.log(str1, str2);
        if (str1 !== str2) {
          return false;
        }
        return true;
      },
      /**
       * 返回指定变量的数据类型
       * @param  {Any} data
       * @return {String}
       */
      type(data) {
        return Object.prototype.toString.call(data).slice(8, -1);
      }
    }
  }
</script>
