// pages/index/number.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    number: null,
    total: 0,
    isShowTotal: false, //是否显示总额
    orderId: "",
  },
  //获取数量
  getNumber(e) {
    this.setData({
      number: e.detail.value,
    });
  },
  //提交
  sure() {
    let that = this,
      choice = app.globalData.userChoice;
    let goal =
      choice.goalOne +
      "," +
      choice.goalTwo +
      "," +
      choice.goalThree +
      "," +
      choice.goalForth;
    if (that.data.number) {
      app.globalData.userChoice.number = that.data.number;
      wx.redirectTo({
        url: "/pages/index/detail",
      });
      // wx.showModal({
      //   title: '',
      //   content: '确定要提交吗？',
      //   success: res => {
      //     if (res.confirm) {
      //       wx.showLoading({
      //         title: '请等待',
      //       })
      //       app.globalData.userChoice.number = that.data.number
      //       console.log(app.globalData.userChoice)

      //       wx.request({
      //         url: app.globalData.api + '/countTotal',
      //         method: 'POST',
      //         data: {
      //           openid: wx.getStorageSync('openid'),
      //           user_id:wx.getStorageSync('user_id'),
      //           purpose_id: choice.purpose,
      //           clean_id: choice.dataClean,
      //           entry_id: choice.dataEntry,
      //           goal_one :choice.goalOne ,
      //           goal_two: choice.goalTwo ,
      //           goal_three: choice.goalThree ,
      //           goal_forth:choice.goalForth,
      //           method_id: choice.method,
      //           number: choice.number
      //         },
      //         success: r => {
      //           console.log(r.data)
      //           if(r.data.code==0){
      //             console.log('object');
      //             // that.setData({
      //             //   orderId:r.data.id,
      //             //   isShowTotal:true
      //             // })
      //             wx.redirectTo({
      //               url: '/pages/index/detail?id='+r.data.id,
      //               success: (result)=>{
      //                 console.log(result);
      //               },
      //               fail: ()=>{
      //                 console.log('fail');
      //               },
      //               complete: ()=>{
      //                 console.log('complete');
      //               }
      //             });
      //           }else{
      //             wx.showToast({
      //               title:'出错了',
      //               icon:'none'
      //             })
      //           }
      //           wx.hideLoading()
      //         }
      //       })
      //     }
      //   },

      // })
    } else {
      wx.showToast({
        title: "请填写诊次数量！",
        icon: "none",
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.userChoice.number = null;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
