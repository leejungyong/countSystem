<template>
  <div class="order-detail">
    <!-- 订单列表 -->
        <div style="background:#eee;padding: 20px">
        <Card :bordered="false">
            <p slot="title">数据挖掘目标</p>
            <p v-for="(item,index) in purpose" :key="index">
                {{item.purposeName}}
            </p>
        </Card>
          <Card :bordered="false" class="card">
            <p slot="title">数据录入</p>
            <div v-for="(item,index) in entry" :key="index" class="item">
                <div>{{item.entryName}}</div>
                <div class="price">{{item.totalPrice&&`￥${item.totalPrice}`}}</div>
            </div>
        </Card>
        <Card :bordered="false" class="card">
            <p slot="title">数据清洗</p>
            <div v-for="(item,index) in clean" :key="index" class="item">
                <div>{{item.cleanName}}</div>
                <div class="price">{{item.totalPrice&&`￥${item.totalPrice}`}}</div>
            </div>
        </Card>
           <Card :bordered="false" class="card">
            <p slot="title">数据分析</p>
            <div v-for="(item,index) in goal" :key="index" class="item" >
                <div>{{item.count}}项{{item.typeName}}</div>
                <div class="price">{{item.totalPrice&&`￥${item.totalPrice}`}}</div>
            </div>
        </Card>
          <Card :bordered="false" class="card">
            <p slot="title">数据挖掘方法</p>
            <div v-for="(item,index) in method" :key="index" class="item" >
                <div>{{item.methodName}}</div>
                <div class="price">{{item.totalPrice&&`￥${item.totalPrice}`}}</div>
            </div>
        </Card>
         <Card :bordered="false" class="card">
            <p slot="title">诊次数量</p>
            <p>{{number}}</p>
        </Card>
             <Card :bordered="false" class="card">
            <p slot="title">数据分析报告</p>
            <div class="item" >
                <div>报告</div>
                <div class="price">{{reporter&&`￥${reporter}`}}</div>
            </div>
        </Card>
           <Card :bordered="false" class="card" style="font-size:18px;">
            <p slot="title" style="color:red;">合计</p>
            <p>{{`￥${totalPrice}`}}</p>
        </Card>
         <!-- <div class="total">
             <div>合计：</div>
          <div>{{`￥${totalPrice}`}}</div>
         </div> -->
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  data () {
    return {
      id: '',
      purpose: [],
      entry: [],
      clean: [],
      goal: [],
      method: [],
      totalPrice: 0,
      number: 0,
      reporter: 0
    }
  },
  created () {
    console.log(this.$route.query)
    const { id = '' } = this.$route.query
    this.id = id
    this.fetch()
  },
  methods: {
    // 获取订单列表
    fetch () {
      axios.post('/api/getOrderDetail', { orderId: this.id }).then(res => {
        if (res.data) {
          let data = res.data
          this.purpose = data.purpose
          this.entry = data.entry
          this.clean = data.clean
          this.goal = data.goal
          this.method = data.method
          this.totalPrice = data.finalPrice
          this.number = data.number
          this.reporter = data.reporter
        } else {
          this.$Message.warning('出错了哦')
        }
      })
    }
  }
}
</script>

<style scoped>
.card{
    margin-top: 10px;
}
.item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 20%;
    margin-bottom: 10px;
}
.item:last-child{
    margin-bottom: 0;
}
.price{

}
.total{
    display: flex;
    font-size: 18px;
    align-items: center;
    font-weight: 500;
}
</style>
