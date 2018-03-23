<template>
  <div>
    <div class="toolbar">
      <el-row :gutter="20" type="flex" align="middle">
        <el-col :span="12" :offset="9">
          <el-date-picker
            size="small"
            v-model="timepicker.value"
            align="right"
            type="date"
            placeholder="请选择日期"
            :picker-options="timepicker.option"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd">
          </el-date-picker>
          <el-button size="small" type="primary" @click="listLog">查 询</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="log-panel">
      <el-table :data="logs"
                max-height="450"
                :show-header="false"
                :row-class-name="tableRowColor">
        <el-table-column align="center"
                         min-width="150">
          <template slot-scope="scope">
            <el-button type="text" @click="downloadLog(scope.row)">{{scope.row}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        timepicker: {
          value: '',
          option: {
            disabledDate(time) {
              return time.getTime() > Date.now();
            },
            shortcuts: [{
              text: '今天',
              onClick(picker) {
                picker.$emit('pick', new Date());
              }
            }, {
              text: '昨天',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() - 3600 * 1000 * 24);
                picker.$emit('pick', date);
              }
            }]
          }
        },
        logs: []
      };
    },
    methods: {
      tableRowColor(scope, rowIndex) {
        var path = scope.row
        if (path.endsWith(".error.txt")) {
          return 'danger-row';
        }
        return '';
      },
      listLog() {
        if (!this.timepicker.value) {
          this.$message.error("请选择日期后查询。")
          return
        }
        this.$ajax({
          method: 'POST',
          url: '/test/log/list?date=' + this.timepicker.value,
        }).then(response => {
          var result = response.data
          if (result.success) {
            this.logs = result.data
          } else {
            this.logs = []
            this.$message.error(result.message)
          }
        }).catch(error => {
          this.$message.error(error.message)
        })
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
      }
    }
  };
</script>
