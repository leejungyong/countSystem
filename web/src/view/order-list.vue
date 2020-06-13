<template>
  <div class="order">
    <!-- 订单列表 -->
    <Table  :columns="columns" :data="data" border></Table>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  data () {
    return {
      columns: [
        {
          title: '序号',
          key: 'displayorder',
          width: 70
        },
        {
          title: '单位名称',
          key: 'name',
          width: 200,
          ellipsis: true,
          tooltip: true
        },
        {
          title: '联系方式',
          key: 'phone',
          width: 200
        },
        {
          title: '邮箱',
          key: 'email',
          width: 200,
          ellipsis: true,
          tooltip: true
        },
        {
          title: '期待完成日期',
          key: 'deadline',
          width: 150,
          ellipsis: true,
          tooltip: true
        },
        {
          title: '总价',
          key: 'total',
          width: 150,
          ellipsis: true,
          tooltip: true
        },
        {
          title: '创建时间',
          key: 'date',
          // width: 200,
          ellipsis: true,
          tooltip: true
        },
        {
          title: '操作',
          key: 'action',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.$router.push({ path: 'detail', query: { id: params.row.orderId } })
                  }
                }
              }, '详情')
            ])
          }
        }
      ],
      data: []
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    // 获取订单列表
    fetch () {
      axios.post('/api/getOrderList', {}).then(res => {
        console.log(res)
        if (res.data.status) {
          this.data = res.data.data.map((item, index) => {
            item.displayorder = index + 1
            return item
          })
        } else {
          this.$Message.info(res.data.message)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
