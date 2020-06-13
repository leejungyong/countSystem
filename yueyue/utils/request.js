
const app =  getApp();

export default {
  async  baseRequest(params,method='GET'){
        const {url,data,contentType}=params
        return new Promise((resolve,reject)=>{
            wx.request({
                url:app.globalData.api+ url,
                method:method,
                data:data,
                header:{
                    'Content-Type': contentType || 'application/json',
                },
                success:res=>{
                    if(res.code===0){
                        resolve(res.data)
                    }else{
                        reject(res.data)
                    }
                },
                fail:err=>{
                    reject(err.data)
                }
            })
        })
    },

    get(url,data,ops={}){
        const options={url,data,...ops}
      return  this.baseRequest(options)
    },
    post(url,data,ops={}){
        const options={url,data,...ops}
      return  this.baseRequest(options,'POST')
    }
}