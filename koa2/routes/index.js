const router = require("koa-router")();
const Modal = require("../lib/mysql");
const koa2Req = require("koa2-request");

let goalTypeObj = {
  0: "频次频率",
  1: "集内关联规则",
  2: "集外关联规则",
  3: "聚类分析",
};

//根据诊次区间判断每一项价格
function getUnitPrice(num) {
  let price = 0.5;
  if (num >= 1 && num <= 300) {
    price = 0.5;
  } else if (num >= 301 && num <= 600) {
    price = 0.4;
  } else if (num >= 601 && num <= 1000) {
    price = 0.3;
  } else if (num >= 1001 && num <= 5000) {
    price = 0.2;
  } else if (num > 5000) {
    price = 0.1;
  }
  return price;
}

router.get("/", async (ctx, next) => {
  await ctx.render("index", {
    title: "Hello Koa 2!",
  });
});
//获取openid
router.post("/getUserInfo", async (ctx, next) => {
  console.log(this);
  let code = ctx.request.body.code;
  //   secret 0c438370c908190b2b1f6c0f76f131cc
  // appid wx5414c6f60b006bbf
  let appid = "wx5414c6f60b006bbf",
    secret = "0c438370c908190b2b1f6c0f76f131cc";
  // let appid = 'wx1fe47283722d0e7f',
  //   secret = '05f863df427b8d9310e3f99d9f2a8ddd'
  let result = await koa2Req({
    url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`,
  });
  ctx.body = JSON.parse(result.body);
});
// 发送 res.code 到后台换取 openId, sessionKey, unionId
//新增用户信息
router.post("/newUser", async (ctx, next) => {
  const data=ctx.request.body
  let reg= /^[1][3,4,5,7,8][0-9]{9}$/;
if(data.email.indexOf('@')==-1){
    ctx.body={
      status:false,
      message:'请输入正确的邮箱地址'
    }
  }else  if(!reg.test(data.phone)){
    ctx.body={
      status:false,
      message:'请输入正确的手机号码'
    }
  } 
  else{
    await Modal.newUser(ctx.request.body).then((res) => {
      if (res) {
        ctx.body = {
          status: true,
          userId: res.insertId,
        };
      }
    });
  }
});
//查询所有数据挖掘目的
router.post("/purposeList", async (ctx, next) => {
  let object={}
  await Modal.findAllPurpose().then((res) => {
    if(res){
      object={
        code:0,
        data:res
      }
    }else{
      object={
        code:1,
        data:null
      }
    }
  });
  ctx.body=object
});
//查询所有数据录入方法
router.post("/getEntryList", async (ctx, next) => {
  let object={}
  await Modal.findAllEntry().then((res) => {
    if(res){
      object={
        code:0,
        data:res
      }
    }else{
      object={
        code:1,
        data:null
      }
    }
  });
  ctx.body=object
});
//查询所有数据清洗
router.post("/getCleaningList", async (ctx, next) => {
  let object={}
  await Modal.findAllCleaning().then((res) => {
    if(res){
      object={
        code:0,
        data:res
      }
    }else{
      object={
        code:1,
        data:null
      }
    }
  });
  ctx.body=object
});
//查询数据目标类型
router.post("/getGoalByType", async (ctx, next) => {
  let object={}
  let type = ctx.request.body.type;
  await Modal.findGoalByType(type).then((res) => {
    if(res){
      object={
        code:0,
        data:res
      }
    }else{
      object={
        code:1,
        data:null
      }
    }
  });
  ctx.body=object
});

//获取数据挖掘方法
router.post("/getMethods", async (ctx, next) => {
  let object={}
  await Modal.findMethods().then((res) => {
    if(res){
      object={
        code:0,
        data:res
      }
    }else{
      object={
        code:1,
        data:null
      }
    }
  });
  ctx.body=object
});


//价格明细预览
router.post("/orderDetailPreview", async (ctx, next) => {
  let order = ctx.request.body;
  const {
    openid = "",
    purpose_id = "",
    entry_id = "",
    clean_id = "",
    goal_one = "",
    goal_two = "",
    goal_three = "",
    goal_forth = "",
    method_id = "",
    number = "",
    user_id = "",
  } = order;

  const goal_id = goal_one + "," + goal_two + "," + goal_three + "," + goal_forth;

  let purposeData = await Modal.queryPurposeTypeNum(purpose_id);
  let entryData = await Modal.queryEntryType(entry_id);
  let cleanData = await Modal.queryCleanType(clean_id);
  let goalData = await Modal.queryGoalTypeNum(goal_id);
  let methodData = await Modal.queryMethodType(method_id);
  let total = 0;
  let unitPrice = getUnitPrice(number); //数据目标每项的价格
  /**
   * 数据录入计算：单价*诊次
   */
  entryData = entryData.map((item) => {
    item.totalPrice = item.price * number;
    total = total + item.totalPrice;
    return item;
  });
  /**
   * 数据清洗计算：单价*诊次
   */
  cleanData = cleanData.map((item) => {
    item.totalPrice = item.price * number;
    total = total + item.totalPrice;
    return item;
  });

  /**
   * 数据挖掘目标计算公式：（选择种类*单价*诊次）
   * 1.根据诊次区间获取单价 5个等级
   * 2.频次频率  不足五项按5项计算
   * 3.集内集外关联  不足3项按3项计算
   * 4. 聚类 4元*诊次
   *  */
  goalData = goalData.map((item) => {
    item.typeName = goalTypeObj[`${item.goalType}`];
    let p = 0;
    if (item.goalType === 0) {
      //频率频次
      p =
        item.count > 5
          ? unitPrice * item.count * number
          : unitPrice * 5 * number;
    } else if (item.goalType === 1) {
      //集内关联
      p =
        item.count > 3
          ? unitPrice * item.count * number
          : unitPrice * 3 * number;
    } else if (item.goalType === 2) {
      //集外关联
      p =
        item.count > 3
          ? unitPrice * item.count * number
          : unitPrice * 3 * number;
    } else if (item.goalType === 3) {
      //聚类
      p = 4 * number*item.count;
    }
    item.totalPrice = p;
    total = total + item.totalPrice;
    return item;
  });

  /**
   *  数据挖掘方法计算
   */
  methodData = methodData.map((item,index) => {
    item.totalPrice =index===0? item.price * number:'';
    return item;
  });
  total = total + 8*number;
  let reporterPrice=450
  ctx.body = {
    purpose: purposeData,
    entry: entryData,
    clean: cleanData,
    goal: goalData,
    method: methodData,
    reporter:reporterPrice,
    number: number,
    finalPrice: total,
  };
});
//确认订单
router.post("/insertOrder", async (ctx, next) => {
  let order = ctx.request.body;
  await Modal.updateOrder(order).then((res) => {
    if (res.insertId) {
      ctx.body = {
        code:0,
        data:null
      };
    } else {
      ctx.body = {
        code:1,
        data:null
      };
    }
  });
});
//计算价格--废弃
router.post("/countTotal", async (ctx, next) => {
  let order = ctx.request.body;
  let id = "";
  console.log(order);
  await Modal.updateOrder(order).then((r) => {
    id = r.insertId || "";
  });
  let clean_id = ctx.request.body.clean_id.split(","),
    number = ctx.request.body.number,
    goal_one = ctx.request.body.goal_one
      ? ctx.request.body.goal_one.split(",")
      : [],
    goal_two = ctx.request.body.goal_two
      ? ctx.request.body.goal_two.split(",")
      : [],
    goal_three = ctx.request.body.goal_three
      ? ctx.request.body.goal_three.split(",")
      : [],
    goal_forth = ctx.request.body.goal_forth
      ? ctx.request.body.goal_forth.split(",")
      : [],
    method_id = ctx.request.body.method_id
      ? ctx.request.body.method_id.split(",")
      : [];

  let entryPrice = 0,
    cleanPrice = 0,
    goalOnePrice = 0,
    goalTwoPrice = 0,
    goalThreePrice = 0,
    goalForthPrice = 0,
    methodPrice = 0,
    reporterPrice = 450,
    total = 0;
  //数据录入-计算
  await Modal.queryEntryPrice(order).then((res) => {
    if (res) {
      entryPrice = res[0].price * number;
    }
    t1 = res;
  });

  //数据清洗计算
  if (clean_id[0] != "") {
    await Modal.queryCleanPrice(clean_id).then((res) => {
      t2 = res;
      if (res) {
        let arr = res;
        for (let i = 0; i < arr.length; i++) {
          cleanPrice = parseInt(arr[i].price * number) + parseInt(cleanPrice);
        }
      }
    });
  }

  //数据挖掘目标-计算
  //1-300诊次  301-600 601-1000 1000-5000 5000+
  if (number >= 1 && number <= 300) {
    //频率频次
    if (goal_one.length > 0) {
      if (goal_one.length <= 5) {
        goalOnePrice = 0.5 * 5 * number;
      } else {
        goalOnePrice = 0.5 * goal_one * number;
      }
    } else {
      goalOnePrice = 0;
    }
    //集内关联
    if (goal_two.length > 0) {
      if (goal_two.length <= 3) {
        goalTwoPrice = 0.5 * 3 * number;
      } else {
        goalTwoPrice = 0.5 * goal_two * number;
      }
    } else {
      goalTwoPrice = 0;
    }
    //集外关联
    if (goal_three.length > 0) {
      if (goal_three.length <= 3) {
        goalThreePrice = 0.5 * 3 * number;
      } else {
        goalThreePrice = 0.5 * goal_three * number;
      }
    } else {
      goalThreePrice = 0;
    }
    //聚类
    if (goal_forth.length > 0) {
      goalForthPrice = 4 * number;
    } else {
      goalForthPrice = 0;
    }
  } else if (number >= 301 && number <= 600) {
    //频率频次
    if (goal_one.length > 0) {
      if (goal_one.length <= 5) {
        goalOnePrice = 0.4 * 5 * number;
      } else {
        goalOnePrice = 0.4 * goal_one * number;
      }
    } else {
      goalOnePrice = 0;
    }
    //集内关联
    if (goal_two.length > 0) {
      if (goal_two.length <= 3) {
        goalTwoPrice = 0.4 * 3 * number;
      } else {
        goalTwoPrice = 0.4 * goal_two * number;
      }
    } else {
      goalTwoPrice = 0;
    }
    //集外关联
    if (goal_three.length > 0) {
      if (goal_three.length <= 3) {
        goalThreePrice = 0.4 * 3 * number;
      } else {
        goalThreePrice = 0.4 * goal_three * number;
      }
    } else {
      goalThreePrice = 0;
    }
    //聚类
    if (goal_forth.length > 0) {
      goalForthPrice = 4 * number;
    } else {
      goalForthPrice = 0;
    }
  } else if (number >= 601 && number <= 1000) {
    //频率频次
    if (goal_one.length > 0) {
      if (goal_one.length <= 5) {
        goalOnePrice = 0.3 * 5 * number;
      } else {
        goalOnePrice = 0.3 * goal_one * number;
      }
    } else {
      goalOnePrice = 0;
    }
    //集内关联
    if (goal_two.length > 0) {
      if (goal_two.length <= 3) {
        goalTwoPrice = 0.3 * 3 * number;
      } else {
        goalTwoPrice = 0.3 * goal_two * number;
      }
    } else {
      goalTwoPrice = 0;
    }
    //集外关联
    if (goal_three.length > 0) {
      if (goal_three.length <= 3) {
        goalThreePrice = 0.3 * 3 * number;
      } else {
        goalThreePrice = 0.3 * goal_three * number;
      }
    } else {
      goalThreePrice = 0;
    }
    //聚类
    if (goal_forth.length > 0) {
      goalForthPrice = 4 * number;
    } else {
      goalForthPrice = 0;
    }
  } else if (number >= 1001 && number <= 5000) {
    //频率频次
    if (goal_one.length > 0) {
      if (goal_one.length <= 5) {
        goalOnePrice = 0.2 * 5 * number;
      } else {
        goalOnePrice = 0.2 * goal_one * number;
      }
    } else {
      goalOnePrice = 0;
    }
    //集内关联
    if (goal_two.length > 0) {
      if (goal_two.length <= 3) {
        goalTwoPrice = 0.2 * 3 * number;
      } else {
        goalTwoPrice = 0.2 * goal_two * number;
      }
    } else {
      goalTwoPrice = 0;
    }
    //集外关联
    if (goal_three.length > 0) {
      if (goal_three.length <= 3) {
        goalThreePrice = 0.2 * 3 * number;
      } else {
        goalThreePrice = 0.2 * goal_three * number;
      }
    } else {
      goalThreePrice = 0;
    }
    //聚类
    if (goal_forth.length > 0) {
      goalForthPrice = 4 * number;
    } else {
      goalForthPrice = 0;
    }
  } else if (number > 5000) {
    //频率频次
    if (goal_one.length > 0) {
      if (goal_one.length <= 5) {
        goalOnePrice = 0.1 * 5 * number;
      } else {
        goalOnePrice = 0.1 * goal_one * number;
      }
    } else {
      goalOnePrice = 0;
    }
    //集内关联
    if (goal_two.length > 0) {
      if (goal_two.length <= 3) {
        goalTwoPrice = 0.1 * 3 * number;
      } else {
        goalTwoPrice = 0.1 * goal_two * number;
      }
    } else {
      goalTwoPrice = 0;
    }
    //集外关联
    if (goal_three.length > 0) {
      if (goal_three.length <= 3) {
        goalThreePrice = 0.1 * 3 * number;
      } else {
        goalThreePrice = 0.1 * goal_three * number;
      }
    } else {
      goalThreePrice = 0;
    }
    //聚类
    if (goal_forth.length > 0) {
      goalForthPrice = 4 * number;
    } else {
      goalForthPrice = 0;
    }
  }

  //挖掘方法-计算
  if (method_id.length > 0) {
    methodPrice = 8 * number;
  }
  total =
    entryPrice +
    cleanPrice +
    goalOnePrice +
    goalTwoPrice +
    goalThreePrice +
    goalForthPrice +
    methodPrice +
    reporterPrice;
  // ctx.body = {
  //   total:total,
  //   entryPrice: entryPrice,
  //   cleanPrice: cleanPrice,
  //   goalPrice:goalOnePrice+goalTwoPrice+goalThreePrice+goalForthPrice,
  //   methodPrice:methodPrice,
  //   reporterPrice:reporterPrice
  // }

  ctx.body = {
    code: 0,
    id: id,
  };
});
//订单列表--废弃
router.post("/getOrderList1", async (ctx, next) => {
  let list = [],
    arr = [],
    beforeList = [];
  await Modal.getOrderList().then((res) => {
    arr = res;
    for (let i = 0; i < arr.length; i++) {
      if (beforeList.length == 0) {
        beforeList.push(arr[i]);
      } else {
        let flag = beforeList.every((item) => {
          return item.id != arr[i].id;
        });
        if (flag) {
          beforeList.push(arr[i]);
        }
      }
    }

    for (let j = 0; j < beforeList.length; j++) {
      let goal_one = "",
        goal_two = "",
        goal_three = "",
        goal_forth = "";
      arr.map((item) => {
        if (item.id == beforeList[j].id) {
          if (item.goaltype == 0) {
            goal_one =
              goal_one == "" ? item.goal_name : goal_one + "," + item.goal_name;
          } else if (item.goaltype == 1) {
            goal_two =
              goal_two == "" ? item.goal_name : goal_two + "," + item.goal_name;
          } else if (item.goaltype == 2) {
            goal_three =
              goal_three == ""
                ? item.goal_name
                : goal_three + "," + item.goal_name;
          } else if (item.goaltype == 3) {
            goal_forth =
              goal_forth == ""
                ? item.goal_name
                : goal_forth + "," + item.goal_name;
          }
        }
      });
      beforeList[j].goal_one = goal_one;
      beforeList[j].goal_two = goal_two;
      beforeList[j].goal_three = goal_three;
      beforeList[j].goal_forth = goal_forth;
    }

    ctx.body = beforeList.map((item) => {
      return {
        id: item.id,
        purpose: item.purpose,
        entry: item.entry,
        clean: item.clean,
        goal_one: item.goal_one,
        goal_two: item.goal_two,
        goal_three: item.goal_three,
        goal_forth: item.goal_forth,
        method: item.method,
        number: item.number,
        user: item.name,
        phone: item.phone,
        date: item.date,
      };
    });
  });
});

//订单列表
router.post('/api/getOrderList',async(ctx,next)=>{
 const res= await Modal.getOrderList()
 if(res){
   ctx.body={
     status:true,
     data:res,
     message:''
   }
 }else{
   ctx.body={
     status:false,
     data:null,
     message:'暂无数据'
   }
 }
})
//某一订单详情
router.post("/api/getOrderDetail", async (ctx, next) => {
  const { orderId = "" } = ctx.request.body;
  let orderObj = {},
    data = {},
    number = 0,
    finalPrice = 0;

  let unitPrice = 0; //数据挖掘目标单价
  const res = await Modal.getOrderDetail(orderId);
  if (res) {
    orderObj = JSON.parse(JSON.stringify(res))[0] || {};
    number = orderObj.number;
    unitPrice = getUnitPrice(number);
    const purposeData = await Modal.queryPurposeTypeNum(orderObj.purpose_id);
    let entryData = await Modal.queryEntryType(orderObj.entry_id);
    let cleanData = await Modal.queryCleanType(orderObj.clean_id);
    let goalData = await Modal.queryGoalTypeNum(orderObj.goal_id);
    let methodData = await Modal.queryMethodType(orderObj.method_id);
    /**
     * 数据录入计算：单价*诊次
     */
    let total = 0;
    entryData = entryData.map((item) => {
      item.totalPrice = item.price * number;
      total = total + item.totalPrice;
      return item;
    });
    /**
     * 数据清洗计算：单价*诊次
     */
    cleanData = cleanData.map((item) => {
      item.totalPrice = item.price * number;
      total = total + item.totalPrice;
      return item;
    });

    /**
     * 数据挖掘目标计算公式：（选择种类*单价*诊次）
     * 1.根据诊次区间获取单价 5个等级
     * 2.频次频率  不足五项按5项计算
     * 3.集内集外关联  不足3项按3项计算
     * 4. 聚类 4元*诊次
     *  */
    goalData = goalData.map((item) => {
      item.typeName = goalTypeObj[`${item.goalType}`];
      let p = 0;
      if (item.goalType === 0) {
        //频率频次
        p =
          item.count > 5
            ? unitPrice * item.count * number
            : unitPrice * 5 * number;
      } else if (item.goalType === 1) {
        //集内关联
        p =
          item.count > 3
            ? unitPrice * item.count * number
            : unitPrice * 3 * number;
      } else if (item.goalType === 2) {
        //集外关联
        p =
          item.count > 3
            ? unitPrice * item.count * number
            : unitPrice * 3 * number;
      } else if (item.goalType === 3) {
        //聚类
        p = 4 * number;
      }
      item.totalPrice = p;
      total = total + item.totalPrice;
      return item;
    });

    /**
     *  数据挖掘方法计算
     */
    // methodData = methodData.map((item) => {
    //   item.totalPrice = item.price * number;
    //   total = total + item.totalPrice;
    //   return item;
    // });
    methodData = methodData.map((item,index) => {
      item.totalPrice =index===0? item.price * number:'';
      return item;
    });
    total = total + 8*number;
    let reporterPrice=450

    ctx.body = {
      purpose: purposeData,
      entry: entryData,
      clean: cleanData,
      goal: goalData,
      method: methodData,
      finalPrice: total,
      number: number,
      reporter:reporterPrice
    };
  }
});
router.get("/string", async (ctx, next) => {
  ctx.body = "koa2 string";
});

router.get("/json", async (ctx, next) => {
  ctx.body = {
    title: "koa2 json",
  };
});

module.exports = router;
