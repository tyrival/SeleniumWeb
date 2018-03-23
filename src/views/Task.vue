<template>
  <div>
    <!-- 操作栏 -->
    <div class="toolbar">
      <el-row :gutter="20">
        <el-col v-show="!factory.isRunning" :span="19" :offset="1">
          <el-button size="small" @click="openModalJob(modalJob.type.CREATE)">新增请求</el-button>
          <el-button size="small" @click="openModalTemplateSave">保 存</el-button>
          <el-button size="small" @click="openModalTemplateLoad">模 板</el-button>
          <el-button size="small" @click="clearJobStore">清 空</el-button>
          <el-button size="small" @click="exportJobs">导 出</el-button>
          <el-button size="small" @click="openModalImport">导 入</el-button>
        </el-col>
        <el-col v-show="!factory.isRunning" :span="4">
          <el-button size="small" type="primary" @click="runAllJob">全部运行</el-button>
          <el-button size="small" v-show="factory.log" @click="downloadLog(factory.log)">日志</el-button>
        </el-col>
        <el-col v-show="factory.isRunning" :span="20" :offset="1">
          <el-progress :stroke-width="15" :percentage="getRunningProgress()"></el-progress>
        </el-col>
        <el-col v-show="factory.isRunning" :span="3">
          <el-button size="small" type="danger" @click="factory.isRunning = false">停止运行</el-button>
        </el-col>
      </el-row>
    </div>
    <!-- 任务列表 -->
    <div class="panel">
      <template v-if="toggleAccordion()">
        <el-collapse v-model="accordion.activePanel">
          <template v-for="(sys, sysIndex) in system">
            <template v-if="toggleAccordionPanel(sys.name)">
              <el-collapse-item :name="sysIndex">
                <template slot="title">
                  <strong>{{ sys.comment }}</strong>{{ " ( " + sys.url + " )" }}
                  <span class="system-status">
                    <el-tag size="medium" type="success" v-show="summaryInfo(sys.name, status.SUCCESS) != 0">
                      成功：{{ summaryInfo(sys.name, status.SUCCESS) }}
                    </el-tag>
                    <el-tag size="medium" type="danger" v-show="summaryInfo(sys.name, status.FAIL) != 0">
                      失败：{{ summaryInfo(sys.name, status.FAIL) }}
                    </el-tag>
                    <el-tag size="medium" type="warning" v-show="summaryInfo(sys.name, status.ERROR) != 0">
                      异常：{{ summaryInfo(sys.name, status.ERROR) }}
                    </el-tag>
                    <el-tag size="medium" v-show="summaryInfo(sys.name, status.RUNNING) != 0">
                      运行中：{{ summaryInfo(sys.name, status.RUNNING) }}
                    </el-tag>
                    <el-tag size="medium" type="info">
                      {{ "未运行：" + summaryInfo(sys.name, status.UNSUBMIT) + " / 总数：" + jobStore[sys.name].length }}
                    </el-tag>
                  </span>
                </template>
                <div class="accordion-panel" v-loading="factory.isRunning">
                  <template v-for="(job, index) in jobStore[sys.name]">
                    <el-row v-if="index % 4 == 0" :gutter="20">
                      <template v-for="i in 4">
                        <template v-if="index + i - 1 < jobStore[sys.name].length">
                          <el-col class="card-space" :span="6">
                            <el-card class="box-card">
                              <div slot="header" class="clearfix">
                                <span>{{ jobStore[sys.name][index + i - 1].name }}</span>
                                <el-button type="text" class="el-icon el-icon-edit-outline"
                                           v-show="jobStore[sys.name][index + i - 1].status == status.UNSUBMIT
                                                || jobStore[sys.name][index + i - 1].status == status.ERROR
                                                || jobStore[sys.name][index + i - 1].status == status.FAIL"
                                           @click="openModalJob(modalJob.type.EDIT, sys.name, index + i - 1)">
                                </el-button>
                                <!--<el-button v-show="jobStore[sys.name][index + i - 1].status == status.SUCCESS
                                                || jobStore[sys.name][index + i - 1].status == status.FAIL"
                                           type="primary" round size="mini" plain
                                           class="float-right"
                                           @click="openModalLog(sys.name, index + i - 1)">日志
                                </el-button>-->
                              </div>
                              <div class="text item">系统：{{ jobStore[sys.name][index + i - 1].systemComment }}</div>
                              <div class="text item">
                                环境：{{ jobStore[sys.name][index + i - 1].configComment }}
                                <span class="float-right">
                                <el-popover trigger="hover" placement="top">
                                  消息: {{ jobStore[sys.name][index + i - 1].message }}
                                  <div slot="reference">
                                    <el-tag size="medium"
                                            :type="getTagTypeByStatus(jobStore[sys.name][index + i - 1].status)">
                                      {{ jobStore[sys.name][index + i - 1].status }}
                                    </el-tag>
                                  </div>
                                </el-popover>
                              </span>
                              </div>
                            </el-card>
                            <template>
                              <div class="card-icon-panel">
                                <i v-if="jobStore[sys.name][index + i - 1].status == status.UNSUBMIT
                                  || jobStore[sys.name][index + i - 1].status == status.FAIL
                                  || jobStore[sys.name][index + i - 1].status == status.ERROR"
                                   class="card-icon close el-icon-close"
                                   @click="deleteJob(sys.name, index + i - 1)">
                                </i>
                                <i v-if="jobStore[sys.name][index + i - 1].status == status.SUCCESS"
                                   class="card-icon reset el-icon-refresh"
                                   @click="resetJob(sys.name, index + i - 1)">
                                </i>
                                <i v-if="jobStore[sys.name][index + i - 1].status != status.SUCCESS
                                        && jobStore[sys.name][index + i - 1].status != status.RUNNING"
                                   class="card-icon run el-icon-caret-right"
                                   @click="runJob(sys.name, index + i - 1)">
                                </i>
                                <i v-show="jobStore[sys.name][index + i - 1].status == status.SUCCESS
                                                || jobStore[sys.name][index + i - 1].status == status.FAIL"
                                   class="card-icon log el-icon-tickets"
                                   @click="openModalLog(sys.name, index + i - 1)">
                                </i>
                              </div>
                            </template>
                          </el-col>
                        </template>
                      </template>
                    </el-row>
                  </template>
                </div>
              </el-collapse-item>
            </template>
          </template>
        </el-collapse>
      </template>
    </div>

    <!-- 任务详情弹窗 -->
    <el-dialog
      width="80%"
      top="5vh"
      :title="modalJob.title"
      :visible.sync="modalJob.visible"
      :before-close="closeModalJob">
      <el-form :inline="true"
               :model="modalJob.job"
               :rules="modalJob.rules"
               label-width="100px"
               ref="modalJobForm"
               size="small">
        <el-col :span="8">
          <el-form-item label="任务名称">
            <el-input v-if="modalJob.status !== modalJob.type.INFO"
                      v-model="modalJob.job.name"
                      placeholder="测试任务"></el-input>
            <span v-else>: {{ modalJob.job.name }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="测试系统" prop="system">
            <el-select v-if="modalJob.status !== modalJob.type.INFO"
                       v-model="modalJob.job.system"
                       placeholder="请选择测试系统"
                       @change="changeSystem($event)">
              <el-option v-for="option in system"
                         :key="option.name"
                         :label="option.comment"
                         :value="option.name">
              </el-option>
            </el-select>
            <span v-else>: {{ modalJob.job.systemComment }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="测试环境" prop="config">
            <el-select v-if="modalJob.status !== modalJob.type.INFO"
                       v-model="modalJob.job.config"
                       placeholder="请选择测试环境"
                       @change="changeConfig($event)">
              <el-option v-for="option in config"
                         :key="option.name"
                         :label="option.comment"
                         :value="option.name">
              </el-option>
            </el-select>
            <span v-else>: {{ modalJob.job.configComment }}</span>
          </el-form-item>
        </el-col>
      </el-form>
      <div v-if="modalJob.status !== modalJob.type.INFO" class="toolbar">
        <el-button type="primary" size="small" @click="openModalTask" round>添加脚本</el-button>
        <el-button type="primary" size="small" @click="deleteTask" round>删除</el-button>
      </div>
      <div class="table">
        <el-table
          size="mini"
          :data="modalJob.job.tasks"
          default-expand-all
          max-height="400"
          @selection-change="handlerJobSelection"
          ref="modalJobTable">
          <template v-if="modalJob.status !== modalJob.type.INFO">
            <el-table-column
              :reserve-selection="true"
              type="selection"
              align="center"
              width="40">
            </el-table-column>
          </template>
          <el-table-column v-if="modalJob.status !== modalJob.type.INFO" width="80" label="排序" align="center">
            <template slot-scope="scope">
              <el-button-group>
                <el-button type="text"
                           class="task-sort"
                           size="mini"
                           icon="el-icon-caret-top"
                           :disabled="scope.$index === 0"
                           @click="changeTaskSeq(scope.$index, -1)"></el-button>
                <el-button type="text"
                           class="task-sort"
                           size="mini"
                           icon="el-icon-caret-bottom"
                           :disabled="scope.$index === modalJob.job.tasks.length - 1"
                           @click="changeTaskSeq(scope.$index, 1)"></el-button>
              </el-button-group>
            </template>
          </el-table-column>
          <el-table-column type="expand" label="参数" width="80">
            <template slot-scope="scope">
              <el-form label-position="left" inline class="task-table-expand-step">
                <template v-for="(step, i) in scope.row.steps">
                  <el-form-item :label="formatStep(scope, i)">
                    <el-input v-if="modalJob.status !== modalJob.type.INFO"
                              :value="formatArrayToString(scope.row.params[i])"
                              @blur="formatStringToArray($event, scope, i)"
                              size="small"
                              placeholder="参数">
                    </el-input>
                    <span v-else>: {{ scope.row.params[i] }}</span>
                  </el-form-item>
                </template>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="名称"
            min-width="100">
          </el-table-column>
          <el-table-column
            prop="comment"
            label="说明"
            min-width="200">
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeModalJob">取 消</el-button>
        <el-button size="small" v-if="modalJob.status !== modalJob.type.INFO" type="primary"
                   @click="saveJob">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 选择脚本弹窗 -->
    <el-dialog
      width="80%"
      top="5vh"
      title="脚本列表"
      :visible.sync="modalTask.visible">
      <el-form :inline="true"
               :model="modalJob.job"
               label-width="100px"
               size="small">
        <el-form-item style="float: right">
          <el-button @click="filterTaskList">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-input v-model="modalTask.keyword" placeholder="模糊查询" clearable></el-input>
        </el-form-item>
      </el-form>
      <div class="table">
        <el-table
          size="mini"
          ref="modalTaskTable"
          :data="modalTask.filterList"
          max-height="450"
          @selection-change="handlerTaskSelection">
          <el-table-column
            :reserve-selection="true"
            type="selection"
            align="center"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="名称"
            min-width="100">
          </el-table-column>
          <el-table-column
            prop="comment"
            label="说明"
            min-width="200">
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="modalTask.visible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="saveTask">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 日志弹窗 -->
    <el-dialog
      width="70%"
      top="5vh"
      title="日志列表"
      :visible.sync="modalLog.visible"
      :before-close="closeModalLog">
      <div class="table">
        <el-table size="mini"
                  :data="modalLog.logs"
                  max-height="450"
                  :row-class-name="tableRowColor">
          <el-table-column prop="path"
                           label="日志"
                           min-width="150">
            <template slot-scope="scope">
              <el-button type="text" @click="downloadLog(scope.row.path)">{{scope.row.path}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeModalLog()">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog
      width="70%"
      top="5vh"
      title="导入"
      :visible.sync="modalImport.visible">
      <el-form :model="modalImport"
               label-width="0"
               size="small">
        <el-form-item>
          <el-input type="textarea"
                    :autosize="{ minRows: 3, maxRows: 10}"
                    v-model="modalImport.json"
                    placeholder="将任务列表文本贴至此处，然后导入">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" @click="importJobs">导 入</el-button>
      </span>
    </el-dialog>

    <!-- 模板保存弹窗 -->
    <el-dialog
      width="50%"
      top="5vh"
      title="保存模板"
      :before-close="onCloseModalTemplateSave"
      :visible.sync="template.modalSave.visible">
      <el-form label-width="80px">
        <el-form-item label="模板名称">
          <el-input v-model="template.newName" size="small"></el-input>
        </el-form-item>
      </el-form>
      <el-table
        size="mini"
        :data="template.store"
        highlight-current-row
        @row-click="selectTemplateName"
        max-height="400">
        <el-table-column
          :formatter="formatTemplateTable"
          label="已有模板"
          min-width="100">
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="template.modalSave.visible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="saveTemplate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 模板加载弹窗 -->
    <el-dialog
      width="50%"
      top="5vh"
      title="模板"
      :before-close="onCloseModalTemplateLoad"
      :visible.sync="template.modalLoad.visible">
      <el-table
        ref="templateLoadTable"
        size="mini"
        :data="template.store"
        highlight-current-row
        @current-change="selectTemplateLoad"
        max-height="400">
        <el-table-column
          :formatter="formatTemplateTable"
          label="模板名"
          min-width="200">
        </el-table-column>
        <el-table-column
          label=""
          align="center"
          width="100">
          <template slot-scope="scope">
            <el-button @click="deleteTemplate(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="template.modalLoad.visible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="loadTemplate">加 载</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import clipboard from 'clipboard-polyfill'

  export default {
    name: "Task",
    data() {
      return {
        // 任务运行工厂
        factory: {
          // 运行状态
          isRunning: false,
          // 开始时间
          startTime: null,
          // 结束时间
          endTime: null,
          // 最大并发数
          CONCURRENCY_JOB_NUM: 1,
          // 指针，指向下个任务索引
          index: 0,
          // 待运行任务列表
          jobs: [],
          // 日志
          log: ''
        },
        // 最大并发数
        status: {
          UNSUBMIT: '未提交',
          ERROR: '异常',
          FAIL: '失败',
          SUCCESS: '完成',
          RUNNING: '运行中'
        },
        // 系统列表 { name: 名称, comment: 说明, url: url, task: 候选Task列表 }
        system: [],
        // 测试环境
        config: [],
        // 任务分组
        accordion: {
          // 默认展开的面板索引
          activePanel: []
        },
        jobStore: {
          /*
            // 系统名
            "scm": [
               // 任务对象
               {
                  // 任务名称
                  name: '默认任务',
                  // 系统名
                  system: 'scm',
                  // 系统说明
                  systemComment: '社管2.5',
                  // 测试环境
                  config: 'chrome',
                  // 测试环境说明
                  configComment: 'chrome测试',
                  // 任务状态：status = { UNSUBMIT, FAIL, ERROR, SUCCESS }
                  status: this.status.UNSUBMIT,
                  // 任务执行消息
                  message: '',
                  // 任务返回的日志地址
                  logs: ["/log1.txt", "/log2.txt", "/log3.txt", "/log4.txt"],
                  // 脚本序列
                  tasks: [{
                    // 脚本名
                    name: 'WfCreate',
                    // 脚本步骤
                    steps: [
                      { module: "Common", method: "login" },
                      { module: "Workflow", method: "create" },
                      { module: "Common", method: "logout" }
                    ],
                    // 脚本步骤对应的参数
                    params: [["administrator", "shzl2018"], [], []]
                  }]
                }
             ]
           */
        },
        // 任务详情弹窗
        modalJob: {
          type: {
            CREATE: "新增任务",
            EDIT: "编辑任务",
            INFO: "任务详情"
          },
          // 校验规则
          rules: {
            system: [
              {required: true, message: '请选择测试系统', trigger: 'blur'},
            ],
            config: [
              {required: true, message: '请选择测试环境', trigger: 'blur'},
            ]
          },
          // 弹窗是否显示
          visible: false,
          // 弹窗标题
          title: null,
          // 当前任务在整个任务列表中的索引
          index: null,
          // 弹窗作用：0 详情, 1 新增, 2 编辑
          status: null,
          // 已添加脚本表的被选中行
          selection: [],
          // 弹窗加载的任务信息
          job: {}
        },
        // 任务列表弹窗
        modalTask: {
          // 弹窗是否显示
          visible: false,
          // 查询关键字
          keyword: '',
          // 待选脚本表中被选中的行
          selection: [],
          // 全部脚本
          list: [],
          // 经过keyword过滤后的脚本
          filterList: []
        },
        // 日志列表弹窗
        modalLog: {
          // 弹窗是否显示
          visible: false,
          // 日志列表
          logs: []
        },
        // 导入弹窗
        modalImport: {
          visible: false,
          json: ''
        },
        // 模板属性
        template: {
          // 当前加载的模板名
          loadName: null,
          // 保存模板时填写的名称
          newName: '',
          // 加载已有模板时，选中的模板名
          selectLoad: '',
          // 已有模板的名称列表
          store: [],
          // 保存模板弹窗
          modalSave: {
            visible: false
          },
          // 加载模板弹窗
          modalLoad: {
            visible: false
          }
        },
      }
    },
    mounted() {
      this.load()
    },
    methods: {
      /* ==================== 列表 ==================== */
      /**
       * 初始化数据
       */
      load() {
        // 获取系统列表
        this.$ajax({
          method: 'POST',
          url: '/test/system/list',
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.system = result.data
            if (!this.system || !this.system.length) {
              return
            }
            this.initJobStore()
            this.expandAllPanel()
          } else {
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })

        // 获取测试环境列表
        this.$ajax({
          method: 'POST',
          url: '/test/config/list',
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.config = result.data
          } else {
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })

        this.initTemplate()
      },
      /**
       * 初始化模板列表
       */
      initTemplate() {
        this.$ajax({
          method: 'POST',
          url: '/test/template/list',
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.template.store = result.data
          } else {
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })
      },
      /**
       * 初始化任务列表
       */
      initJobStore() {
        if (!this.system || !this.system.length) {
          return
        }
        for (var i = 0; i < this.system.length; i++) {
          this.jobStore[this.system[i].name] = []
        }
      },
      /**
       * 展开所有面板
       */
      expandAllPanel() {
        if (!this.system || !this.system.length) {
          return
        }
        this.accordion.activePanel = []
        for (var i = 0; i < this.system.length; i++) {
          this.accordion.activePanel.push(i)
        }
      },
      /**
       * 控制Accordion总面板是否显示
       */
      toggleAccordion() {
        if (this.jobStore) {
          for (var key in this.jobStore) {
            var store = this.jobStore[key]
            if (store && store.length && store.length > 0) {
              return true
            }
          }
        }
        return false
      },
      /**
       * 控制Accordion分组面板是否显示
       */
      toggleAccordionPanel(sysName) {
        return this.jobStore[sysName].length > 0
      },
      /**
       * 清空任务清单
       */
      clearJobStore() {
        this.$confirm('任务清空后不可恢复，是否继续？')
          .then(_ => {
            this.initJobStore()
          })
          .catch(_ => {
          })
      },
      /**
       * 运行任务总进度
       */
      getRunningProgress() {
        if (this.factory.jobs.length <= 0) {
          return 0
        }
        return Math.round((this.factory.index - this.factory.CONCURRENCY_JOB_NUM + 1) * 100 / this.factory.jobs.length)
      },
      /**
       * 汇总标签文本
       */
      summaryInfo(sysName, status) {
        var jobArray = this.jobStore[sysName]
        var count = 0
        for (var i = 0; i < jobArray.length; i++) {
          var job = jobArray[i];
          if (job.status == status) {
            count++
          }
        }
        return count
      },
      /**
       * 打开任务详情弹窗，如果是编辑任务，则将点击的任务复制一个副本载入弹窗
       */
      openModalJob(type, sysName, jobIndex) {
        this.modalJob.status = type
        this.modalJob.title = type
        this.modalJob.index = jobIndex
        if (sysName) {
          var curJob = this.jobStore[sysName][jobIndex]
          // 深度拷贝一份Job对象，用于详情弹窗
          // Object.assign(this.modalJob.job, curJob)是浅拷贝
          this.modalJob.job = JSON.parse(JSON.stringify(curJob))
          // 备份system，用来对比change事件
          this.modalJob.job.systemBak = this.modalJob.job.system
          // 储存原始system，在保存时用来判断job是否要换组
          this.modalJob.job.systemOrig = this.modalJob.job.system
        } else {
          this.modalJob.job = {
            status: this.status.UNSUBMIT,
            name: '测试任务',
            system: '',
            systemBak: '',
            systemComment: '',
            config: '',
            configComment: '',
            tasks: [],
            logs: []
          }
        }
        this.modalJob.visible = true
      },
      /**
       * 删除任务
       */
      deleteJob(sysName, index) {
        this.$confirm('任务删除后不可恢复，是否继续？')
          .then(_ => {
            this.jobStore[sysName].splice(index, 1)
            // 触发折叠面板的展开操作，否则会出现card的数据删掉了，
            // 但是组件没有重新渲染的情况，估计是个bug
            this.expandAllPanel()
          })
          .catch(_ => {
          })
      },
      /**
       * 重置完成的任务
       */
      resetJob(sysName, index) {
        var job = this.jobStore[sysName][index]
        job.status = this.status.UNSUBMIT
        job.message = ''
        job.logs = []
      },
      /**
       * 格式化factory日志
       */
      formatFactoryLog() {
        if (!this.factory.jobs || !this.factory.jobs.length) {
          return ''
        }
        var head = "开始时间: " + this.factory.startTime + "@结束时间: " + this.factory.endTime + "@"
        var success = 0
        var error = 0
        var fail = 0
        var log = ""
        for (var i = 0; i < this.factory.jobs.length; i++) {
          var job = this.factory.jobs[i]
          switch (job.status) {
            case this.status.SUCCESS:
              success++
              break
            case this.status.FAIL:
              fail++
              break
            case this.status.ERROR:
              error++
              break
          }
          log = log + job.systemComment + " | " + job.configComment + " | " + job.status + " | " + job.message + "@"
        }
        head = head + "共 " + this.factory.jobs.length + " 个任务，成功：" + success + "  失败：" + fail + "  异常：" + error + "@"
        head = head + "系统 | 环境 | 运行结果 | 消息@"
        this.factory.log = head + log
      },
      /**
       * 获取日期
       */
      formatDatetime() {
        if (!Date.prototype.format) {
          Date.prototype.format = function (fmt) {
            var o = {
              "M+": this.getMonth() + 1,                 //月份
              "d+": this.getDate(),                    //日
              "h+": this.getHours(),                   //小时
              "m+": this.getMinutes(),                 //分
              "s+": this.getSeconds(),                 //秒
              "q+": Math.floor((this.getMonth() + 3) / 3), //季度
              "S": this.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt)) {
              fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
              if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
              }
            }
            return fmt;
          }
        }
        return new Date().format("yyyy-MM-dd hh:mm:ss")
      },
      /**
       * 保存Factory日志
       */
      saveFactoryLog() {
        this.$ajax({
          method: 'POST',
          url: '/test/log/save/summary?startTime=' + this.factory.startTime + '&endTime=' + this.factory.endTime + '&content=' + this.factory.log,
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.factory.log = result.data
          } else {
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })
      },
      /**
       * 执行所有任务
       */
      runAllJob() {
        if (!this.jobStore) {
          this.$message.error('没有可执行的任务。');
          return
        }
        // 待运行任务
        this.factory.jobs = []
        // 将所有组中的可运行任务（状态不为完成和运行中）过滤出来
        for (var key in this.jobStore) {
          var jobArray = this.jobStore[key]
          for (var i = 0; i < jobArray.length; i++) {
            var job = jobArray[i]
            if (job.status == this.status.SUCCESS || job.status == this.status.RUNNING) {
              continue
            }
            this.factory.jobs.push(job)
          }
        }
        // 重置指针
        this.factory.index = 0
        this.factory.startTime = this.formatDatetime()
        this.factory.isRunning = true
        this.factory.log = ''
        // 按照最大并发数，并发执行任务
        this.runConcurrencyJob()
      },
      /**
       * 并发运行任务
       */
      runConcurrencyJob() {
        // 指针位置超出数组时，停止执行
        if (this.factory.index >= this.factory.jobs.length || !this.factory.isRunning) {
          this.factory.endTime = this.formatDatetime()
          this.formatFactoryLog()
          this.saveFactoryLog()
          this.factory.isRunning = false
          return
        }
        // 请求组
        var reqArray = []
        // 为请求组加入请求，每次加入至少一个，最大不超过并发数，且索引不能超出任务组索引
        for (var j = 0; j < this.factory.CONCURRENCY_JOB_NUM; j++) {
          if (this.factory.index >= this.factory.jobs.length) {
            break
          }
          var reqJob = this.factory.jobs[this.factory.index]
          // 清空请求的消息属性
          reqJob.message = null
          // 将请求的状态改为运行
          reqJob.status = this.status.RUNNING
          // 添加一个并发请求到请求组
          reqArray.push(this.$ajax.post('/test/run?param=' + JSON.stringify(reqJob)))
          // 索引向后移1位
          this.factory.index++
        }
        var me = this
        // 执行并发请求组
        me.$ajax.all(reqArray)
          .then(me.$ajax.spread(function () {
            // arguments是response数组，与request数组一一对应
            if (!arguments || !arguments.length) {
              return
            }
            // 遍历response
            for (var x = 0; x < arguments.length; x++) {
              // 获取任务在整个待运行任务组中的索引
              var index = me.factory.index - arguments.length + x
              // 获取任务
              var execJob = me.factory.jobs[index]
              // 获取responseText
              var result = arguments[x].data
              // 获取日志，并附加到任务的日志组
              var log = result.data
              if (!execJob.logs) {
                execJob.logs = []
              }
              execJob.logs = execJob.logs.concat(log)
              if (result.success) {
                // 任务置为成功状态
                execJob.status = me.status.SUCCESS
              } else {
                // 将任务置为失败状态
                execJob.status = me.status.FAIL
              }
              // 储存responseText中的message
              execJob.message = result.message
            }
            // 递归调用，直到整个数组执行完毕
            me.runConcurrencyJob()
          }))
          .catch(error => {
            // 将所有任务状态置为错误
            var index = me.factory.index - reqArray.length
            for (var x = index; x < me.factory.index; x++) {
              var job = me.factory.jobs[x];
              job.status = me.status.ERROR
              job.message = error.message
            }
            // 递归调用，直到整个数组执行完毕
            me.runConcurrencyJob()
          })
      },
      /**
       * 执行单个任务
       */
      runJob(sysName, index) {
        if (!this.jobStore || !this.jobStore[sysName] || !this.jobStore[sysName].length || this.jobStore[sysName].length <= index) {
          this.$message.error('第' + (index + 1) + '个任务不存在')
          return
        }
        var job = this.jobStore[sysName][index]
        job.message = null
        job.status = this.status.RUNNING
        this.factory.isRunning = true
        this.$ajax({
          method: 'POST',
          url: '/test/run?param=' + JSON.stringify(job),
        }).then(response => {
          this.factory.isRunning = false
          var result = response.data
          if (!job.logs) {
            job.logs = []
          }
          job.logs = job.logs.concat(result.data)
          if (result.success) {
            job.status = this.status.SUCCESS
          } else {
            job.status = this.status.FAIL
            job.message = result.message
          }
        }).catch(error => {
          this.factory.isRunning = false
          job.status = this.status.ERROR
          job.message = error.message
        })
      },
      /**
       * 根据状态获取tag颜色
       */
      getTagTypeByStatus(status) {
        switch (status) {
          case this.status.RUNNING:
            return ''
          case this.status.SUCCESS:
            return 'success'
          case this.status.FAIL:
            return 'danger'
          case this.status.ERROR:
            return 'warning'
          default:
            return 'info'
        }
      },
      /**
       * 导出任务列表
       */
      exportJobs() {
        if (!this.jobStore) {
          this.$message.error('任务列表被删除，请联系开发人员');
          return
        }
        var ieEmpty = true
        for (var key in this.jobStore) {
          if (this.jobStore[key].length && this.jobStore[key].length > 0) {
            ieEmpty = false
            break
          }
        }
        if (ieEmpty) {
          this.$message.error('空任务列表无法导出');
          return
        }
        clipboard.writeText(JSON.stringify(this.jobStore))
        this.$message({
          message: '任务列表已复制到剪贴板',
          type: 'success'
        });
      },
      /**
       * 打开任务列表
       */
      openModalImport() {
        this.modalImport.visible = true
      },
      /**
       * 导入任务列表
       */
      importJobs() {
        if (!this.modalImport.json) {
          this.$message.error('空字符串无法导入');
        }
        this.jobStore = JSON.parse(this.modalImport.json)
        if (!this.jobStore) {
          this.initJobStore()
        }
        this.modalImport.visible = false
        this.modalImport.json = ''
      },

      /* ==================== 新增、编辑、详情弹窗 ==================== */
      /**
       * 打开添加脚本窗口，加载脚本，根据新增、编辑和详情来区分表单样式
       */
      openModalTask() {
        var systemName = this.modalJob.job.system
        if (!systemName) {
          this.$message.error('请先选择测试系统，再添加脚本。');
          return
        }
        var taskList;
        for (var i = 0; i < this.system.length; i++) {
          var sys = this.system[i]
          if (sys.name == systemName) {
            taskList = sys.tasks
            break
          }
        }
        this.modalTask.list = []
        if (taskList && taskList.length) {
          for (var i = 0; i < taskList.length; i++) {
            this.modalTask.list.push(taskList[i])
          }
        }
        this.modalTask.filterList = this.modalTask.list
        this.modalTask.keyword = ''
        this.modalTask.visible = true
      },
      /**
       * 缓存任务编辑弹窗中选中的脚本，用于删除等操作
       */
      handlerJobSelection(val) {
        this.modalJob.selection = val
      },
      /**
       * 保存新增或编辑的任务，并关闭弹窗
       */
      saveJob() {
        var me = this
        this.$refs.modalJobForm.validate((pass) => {
          if (pass) {
            // 新建Job
            if (me.modalJob.status === me.modalJob.type.CREATE) {
              me.jobStore[me.modalJob.job.system].push(me.modalJob.job)
            }
            // 修改Job
            if (me.modalJob.status === me.modalJob.type.EDIT) {
              // 当测试系统未变更时，直接修改原job；反之则删除原job，然后在新的组中增加job
              if (me.modalJob.job.systemOrig == me.modalJob.job.system) {
                me.jobStore[me.modalJob.job.system][me.modalJob.index] = me.modalJob.job
              } else {
                me.jobStore[me.modalJob.job.systemOrig].splice(me.modalJob.index, 1)
                me.jobStore[me.modalJob.job.system].push(me.modalJob.job)
              }
            }
            me.modalJob.visible = false
          }
        })
      },
      /**
       * 关闭详情弹窗
       */
      closeModalJob() {
        this.modalJob.visible = false
      },
      /**
       * 调整任务中的脚本顺序
       */
      changeTaskSeq(index, move) {
        var currentTask = this.modalJob.job.tasks[index]
        var targetTask = this.modalJob.job.tasks[index + move]
        this.modalJob.job.tasks[index + move] = currentTask
        this.modalJob.job.tasks[index] = targetTask
        this.$refs.modalJobTable.doLayout()
      },
      /**
       * 修改测试环境时，缓存测试环境的Comment
       */
      changeConfig(event) {
        var array = this.config
        for (var i = 0; i < array.length; i++) {
          var item = array[i];
          if (item.name == event) {
            this.modalJob.job.configComment = item.comment
            break
          }
        }
      },
      /**
       * 修改测试系统时，如果已经添加过脚本，在确认后会删除脚本
       * 如果未添加脚本，则直接修改，不提示
       * 同时缓存测试系统的Comment
       */
      changeSystem(event) {
        var systemBak = this.modalJob.job.systemBak
        if (event != systemBak && this.modalJob.job.tasks && this.modalJob.job.tasks.length > 0) {
          this.$confirm('修改测试系统将会清空已添加的所有脚本，是否继续', '提示', {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning'
          }).then(() => {
            this.modalJob.job.tasks = []
            this.changeSystemComment(event)
          }).catch(() => {
            this.modalJob.job.system = this.modalJob.job.systemBak
          });
        } else {
          this.changeSystemComment(event)
          this.modalJob.job.systemBak = event
        }
      },
      changeSystemComment(key) {
        var array = this.system
        for (var i = 0; i < array.length; i++) {
          var item = array[i];
          if (item.name == key) {
            this.modalJob.job.systemComment = item.comment
            break
          }
        }
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
      formatStringToArray(event, scope, i) {
        if (!scope.row.params[i]) {
          scope.row.params[i] = []
        }
        var param = scope.row.params[i]
        if (!event.currentTarget.value) {
          param.splice(0, param.length)
          return
        }
        var newArray = event.currentTarget.value.split(",")
        if (newArray.length < param.length) {
          param.splice(newArray.length, param.length - newArray.length)
        }
        if (newArray.length == 0) {
          param.splice(0, param.length)
          return
        }
        for (var i = 0; i < newArray.length; i++) {
          param[i] = newArray[i]
        }
      },
      /**
       * 删除脚本
       */
      deleteTask() {
        this.$confirm('脚本删除后不可恢复，是否继续')
          .then(_ => {
            var array = this.modalJob.selection
            var tasks = this.modalJob.job.tasks
            if (!array || !array.length || !tasks || !tasks.length) {
              return
            }
            for (var i = 0; i < array.length; i++) {
              var item = array[i];
              this.removeItemFromArray(tasks, item)
            }
          })
          .catch(_ => {
          })
      },
      /**
       * 删除数组某个元素
       */
      removeItemFromArray(array, item) {
        if (!array || !array.length) {
          return
        }
        for (var i = 0; i < array.length; i++) {
          var obj = array[i];
          if (obj == item) {
            array.splice(i, 1)
            break
          }
        }
      },
      /**
       * Step对象转字符串
       */
      formatStep(scope, i) {
        return scope.row.steps[i].module + '.' + scope.row.steps[i].method
      },

      /* ==================== 脚本弹窗 ==================== */
      /**
       * 过滤脚本列表
       */
      filterTaskList() {
        if (!this.modalTask.list || this.modalTask.list.length <= 0) {
          return
        }
        this.modalTask.filterList = []
        var kw = this.modalTask.keyword.toLowerCase().trim()
        for (var i = 0; i < this.modalTask.list.length; i++) {
          var task = this.modalTask.list[i];
          if (task.name.toLowerCase().indexOf(kw) >= 0
            || task.comment.toLowerCase().indexOf(kw) >= 0) {
            this.modalTask.filterList.push(task)
          }
        }
      },
      /**
       * 将选中的脚本缓存起来
       */
      handlerTaskSelection(val) {
        this.modalTask.selection = val
      },
      /**
       * 增加选中的脚本到当前任务中
       */
      saveTask() {
        for (var i = 0; i < this.modalTask.selection.length; i++) {
          this.modalJob.job.tasks.push(JSON.parse(JSON.stringify(this.modalTask.selection[i])))
        }
        this.modalTask.visible = false
        this.$refs.modalTaskTable.clearSelection()
      },

      /* ==================== 日志弹窗 ==================== */
      openModalLog(sysName, index) {
        var job = this.jobStore[sysName][index]
        for (var i = 0; i < job.logs.length; i++) {
          var path = job.logs[i];
          this.modalLog.logs.push({
            path: path
          })
        }
        this.modalLog.visible = true
      },
      closeModalLog(done) {
        this.modalLog.logs = []
        this.modalLog.visible = false
        if (done) {
          done()
        }
      },
      downloadLog(path) {
        if (!path) {
          return
        }
        var form = document.createElement("form")
        form.style.display = "none"
        form.target = "_blank"
        form.method = "post"
        form.action = this.$ajax.defaults.baseURL + '/test/log/download'
        var input = document.createElement("input")
        input.style.display = "none"
        input.name = "path"
        input.value = path
        form.append(input)
        document.getElementsByTagName("body")[0].append(form)
        form.submit()
      },
      tableRowColor(scope, rowIndex) {
        var path = scope.row.path
        if (path && path.endsWith(".error.txt")) {
          return 'danger-row';
        }
        return '';
      },

      /* ==================== 模板弹窗 ==================== */
      /**
       * 保存模板弹窗
       */
      openModalTemplateSave() {
        if (!this.jobStore) {
          this.$message.error("任务列表为空，无法保存")
          return
        }
        var isEmpty = true
        for (var key in this.jobStore) {
          var jobs = this.jobStore[key]
          if (jobs && jobs.length && jobs.length > 0) {
            isEmpty = false
            break
          }
        }
        if (isEmpty) {
          this.$message.error("任务列表为空，无法保存")
          return
        }
        this.template.newName = this.template.loadName
        this.template.modalSave.visible = true
      },
      /**
       * 关闭保存模板弹窗时触发
       */
      onCloseModalTemplateSave(done) {
        this.template.newName = ''
        this.template.modalSave.visible = true
        done()
      },
      /**
       * 选择模板名称
       */
      selectTemplateName(row, event, column) {
        this.template.newName = row
      },
      /**
       * 格式化模板表格数据
       */
      formatTemplateTable(row, column, cellValue) {
        return row
      },
      /**
       * 保存模板
       */
      saveTemplate() {
        if (this.templateNameExist(this.template.newName)) {
          this.$confirm('模板[' + this.template.newName + ']已存在，存入当前数据后，原有数据无法恢复，是否覆盖？')
            .then(_ => {
              this.saveTemplateRequest()
            })
            .catch(_ => {
            })
        } else {
          this.saveTemplateRequest()
        }
      },
      /**
       * 发送保存模板的请求
       */
      saveTemplateRequest() {
        var name = this.template.newName
        var content = JSON.stringify(this.jobStore)
        this.$ajax({
          method: 'POST',
          url: '/test/template/save?name=' + name + '&content=' + content,
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.template.loadName = result.data
            this.template.modalSave.visible = false
          } else {
            this.$message.error(result.message)
          }
          this.initTemplate()
        }).catch(error => {
          this.$message.error(error.message)
        })
      },
      /**
       * 判断模板名称是否已经存在
       */
      templateNameExist(name) {
        if (!this.template.store) {
          return false
        }
        for (var i = 0; i < this.template.store.length; i++) {
          if (name == this.template.store[i]) {
            return true
          }
        }
        return false
      },

      /**
       * 打开加载模板弹窗
       */
      openModalTemplateLoad() {
        this.template.modalLoad.visible = true
      },
      /**
       * 关闭加载模板弹窗时触发
       */
      onCloseModalTemplateLoad(done) {
        this.template.selectLoad = ''
        this.template.modalLoad.visible = true
        done()
      },
      /**
       * 选择要加载的模板
       */
      selectTemplateLoad(currentRow, oldCurrentRow) {
        this.template.selectLoad = currentRow
      },
      /**
       * 删除模板
       */
      deleteTemplate(row) {
        this.$confirm('模板删除后不可恢复，是否继续？')
          .then(_ => {
            this.$ajax({
              method: 'POST',
              url: '/test/template/delete?name=' + row,
            }).then(response => {
              this.initTemplate()
              var result = response.data
              if (!result.success) {
                this.$message.error(result.message)
              }
            }).catch(error => {
              this.$message.error(error.message)
            })
          })
          .catch(_ => {
          })
      },
      /**
       * 选择要加载的模板
       */
      loadTemplate() {
        if (!this.template.selectLoad) {
          this.$message.error("未选择需要加载的模板")
          return
        }
        this.$ajax({
          method: 'POST',
          url: '/test/template/get?name=' + this.template.selectLoad,
        }).then(response => {

          var result = response.data
          if (result.success) {
            this.template.loadName = this.template.selectLoad
            this.jobStore = JSON.parse(result.data)
            this.template.modalLoad.visible = false
          } else {
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })
      },
    }
  }
</script>
