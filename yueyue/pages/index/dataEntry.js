// pages/index/purpose.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: null,

  },
  next() {
    let select = []
    this.data.list.map((item, index) => {
      if (item.checked) {
        select.push(item.id)
      }
    })
    if (select.length == 0) {
      wx.showToast({
        title: '必须选择一项！',
        icon: 'none'
      })
    } else {
      app.globalData.userChoice.dataEntry = select[0]
      wx.navigateTo({
        url: './dataClean',
      })
    }
  },
  //选中或取消选择
  select(e) {
    let index = e.currentTarget.id
    let arr = this.data.list
    arr.map(item => {
      item.checked = false
    })
    arr[index].checked = !arr[index].checked
    this.setData({
      list: arr
    })
  },
  //初始化数据
  fetch() {
    let that = this
    wx.request({
      url: app.globalData.api + '/getEntryList',
      method: 'POST',
      data: {},
      success: res => {
        console.log(res.data)
        if (res.data.code==0) {
          let list = res.data.data.map((item, index) => {
            item.checked = false
            return item
          })
          that.setData({
            list: list
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.userChoice.dataEntry = null
    this.fetch()
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