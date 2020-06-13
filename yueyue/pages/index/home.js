// pages/index/home.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:-1,
    name:'',
    email:'',
    phone:'',
    date:'请选择完成日期'
  },
  //选择日期
  pickDate(e){
    this.setData({
      date:e.detail.value
    })
  },
  //单位名称
  getCompany(e){
    this.setData({
      name:e.detail.value
    })
  },
  //电子信箱
  getEmail(e){
    this.setData({
      email:e.detail.value
    })
  },
  //联系方式
  getPhone(e){
    this.setData({
      phone:e.detail.value
    })
  },
  sure(){
    let that=this
    if(that.data.name==''||that.data.email==''||that.data.phone==''||that.data.date=='请选择完成日期'){
      wx.showToast({
        title: '带*号的为必填项',
        icon:'none'
      })
    }else{
      wx.showLoading({
        title: '提交中',
      })
      wx.request({
        url: app.globalData.api+'/newUser',
        method:'POST',
        data:{
          openid:wx.getStorageSync('openid'),
          name:that.data.name,
          email:that.data.email,
          phone:that.data.phone,
          deadline:that.data.date
        },
        success:res=>{
          console.log(res.data)
          if(res.data.status){
            wx.hideLoading()
            wx.setStorageSync('user_id', res.data.userId)
            wx.showModal({
              title:'',
              content:'开始选择吧！',
              showCancel:false,
              success:res=>{
                if(res.confirm){
                  wx.navigateTo({
                    url: './purpose',
                  })
                }
              }
            })
          }else{
            wx.showToast({
              title: res.data.message,
              icon:'none'
            })
          }
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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