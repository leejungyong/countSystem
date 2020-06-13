// pages/index/detail.js
const app= getApp();
let  orderId=''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailInfo:{},
    purpose:[], //数据挖掘目的
    entry:[],   //数据录入
    clean:[],   //数据清洗
    goal:[],    //数据分析
    method:[], //挖掘方法
    totalPrice:0,  //总计
    number:0,     //诊次
    reporter:0,    //数据分析报告
    showCodePic:true,
    codeImg:'../../assets/code.jpg' //付款码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    const {id=''} =options
    orderId=id
    this.fetch()
  },
  //初始化数据
  fetch() {
    let  choice = app.globalData.userChoice
            wx.request({
              url: app.globalData.api + '/orderDetailPreview',
              method: 'POST',
              data: {
                openid: wx.getStorageSync('openid'),
                user_id:wx.getStorageSync('user_id'),
                purpose_id: choice.purpose,
                clean_id: choice.dataClean,
                entry_id: choice.dataEntry,
                goal_one :choice.goalOne ,
                goal_two: choice.goalTwo ,
                goal_three: choice.goalThree ,
                goal_forth:choice.goalForth,
                method_id: choice.method,
                number: choice.number
              },
              success:res=>{
                const {purpose=[],entry=[],clean=[],goal=[],method=[],finalPrice=0,number=0,reporter=0}=res.data
                this.setData({
                  detailInfo:res.data,
                  purpose:purpose,
                  entry:entry,
                  clean:clean,
                  goal:goal,
                  method:method,
                  totalPrice:finalPrice,
                  number:number,
                  reporter:reporter
                })
              }
            })
    // let that = this
    // wx.request({
    //   url: app.globalData.api + '/getOrderDetail',
    //   method: 'POST',
    //   data: {
    //     orderId:orderId
    //   },
    //   success: res => {
    //     console.log(res.data)
    //     const {purpose=[],entry=[],clean=[],goal=[],method=[],finalPrice=0,number=0}=res.data
    //    this.setData({
    //      detailInfo:res.data,
    //      purpose:purpose,
    //      entry:entry,
    //      clean:clean,
    //      goal:goal,
    //      method:method,
    //      totalPrice:finalPrice,
    //      number:number
    //    })
    //   }
    // })
  },
  //确认订单
  sureOrder(){
    let  choice = app.globalData.userChoice
    wx.request({
      url: app.globalData.api + '/insertOrder',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        user_id:wx.getStorageSync('user_id'),
        purpose_id: choice.purpose,
        clean_id: choice.dataClean,
        entry_id: choice.dataEntry,
        goal_one :choice.goalOne ,
        goal_two: choice.goalTwo ,
        goal_three: choice.goalThree ,
        goal_forth:choice.goalForth,
        method_id: choice.method,
        number: choice.number,
        total:this.data.totalPrice
      },
      success:res=>{
       if(res.data.code==0){
         wx.showToast({
           title: '操作成功！'
         });
       }else{
         wx.showToast({
           title: '操作失败',
           icon: 'none'
         });
       }
      }
    })
  },
  //返回首页
  goHome(){
    wx.reLaunch({
      url: '/pages/index/home'
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})