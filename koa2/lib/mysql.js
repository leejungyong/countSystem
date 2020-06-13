var mysql = require('mysql')
var config = require('../config/default')

var pool = mysql.createPool({
  host: config.database.HOST,
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  multipleStatements:true
})



let query = function (sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      console.log('连接...')
      if (err) {
        reject(err)
      } else {
        console.log('连接成功')
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}


//查询数据挖掘目的
let findAllPurpose = function () {
  let _sql = ` select * from purpose;`
  return query(_sql)
}

//查询数据录入
let findAllEntry = function () {
  let _sql = ` select * from dataentry;`
  return query(_sql)
}

//查询数据清洗
let findAllCleaning = function () {
  let _sql = ` select * from dataclean;`
  return query(_sql)
}

//查询数据挖掘方法
let findAllMethods = function () {
  let _sql = ` select * from datamining_method;`
  return query(_sql)
}

//查询数据挖掘目标
let findGoalByType = function (type) {
  let _sql = ` select * from datamining_goal where type=` + type
  return query(_sql)
}
//查询数据挖掘方法
let findMethods = function (type) {
  let _sql = ` select * from datamining_method`
  return query(_sql)
}

//新增订单记录
let updateOrder = function (order) {
  let openid = order.openid,
    purpose_id = order.purpose_id,
    entry_id = order.entry_id,
    clean_id = order.clean_id,
    goal_one = order.goal_one ,
    goal_two= order.goal_two,
    goal_three= order.goal_three ,
    goal_forth= order.goal_forth,
    method_id = order.method_id,
    number = order.number,
    user_id=order.user_id,
    total=order.total
    let goal_id=goal_one+','+goal_two+','+goal_three+','+goal_forth
  // let _sql = `insert into orders set purpose_id='${purpose_id}',entry_id='${entry_id}',clean_id='${clean_id}',goal_one='${goal_one}',goal_two='${goal_two}',goal_three='${goal_three}',goal_forth='${goal_forth}',method_id='${method_id}',number='${number}',opid='${openid}'`
  let _sql = `insert into orders set purpose_id='${purpose_id}',entry_id='${entry_id}',clean_id='${clean_id}',goal_id='${goal_id}',method_id='${method_id}',number='${number}',opid='${openid}',user_id='${user_id}',total='${total}'`
  return query(_sql)
}

//查询价格
let queryEntryPrice = function (order) {
 
  let entry_id = order.entry_id
  let entry_sql = `select * from dataentry where id=${entry_id}`
  return query(entry_sql)
}
//查询清洗价格
let queryCleanPrice = function (ids) {
  let _sql='select * from dataclean where '
  for(let i=0;i<ids.length;i++){
    if(i==ids.length-1){
       _sql+=`id=${ids[i]}`
    }else{
      _sql+=`id=${ids[i]} or `
    }
  
  }
  let clean_sql=_sql

  return query(clean_sql)
  
}

//新用户
let newUser = function (user) {
  let name = user.name,
    email = user.email,
    phone = user.phone,
    deadline = user.deadline,
    openid = user.openid
  let _sql = `insert into user set name='${name}',email='${email}',phone='${phone}',deadline='${deadline}',openid='${openid}'`
  return query(_sql)
}

//所有订单列表
let getOrderList=function(){
  // let _sql=`SELECT  
  // o.id, 
  // g.id AS goalid,
  // g.type AS goaltype,
  // g.name AS goal_name,
  // e.name AS entry,
  // GROUP_CONCAT(DISTINCT m.name ) AS method,
  // GROUP_CONCAT(DISTINCT p.name) AS purpose,
  // GROUP_CONCAT(DISTINCT c.name)AS clean,
  // o.number,
  // u.openid,
  // u.phone,
  // u.name,
  // DATE_FORMAT(o.date, '%Y-%m-%d %H:%i:%S') AS date
  // from orders o
  // JOIN datamining_goal g ON FIND_IN_SET(g.id,o.goal_id) 
  // JOIN datamining_method m ON FIND_IN_SET(m.id,o.method_id)
  // JOIN purpose p ON FIND_IN_SET(p.id,o.purpose_id)
  // JOIN dataclean c ON FIND_IN_SET(c.id,o.clean_id)
  // JOIN dataentry e ON o.entry_id=e.id
  // JOIN user u ON u.openid=o.opid
  // GROUP BY g.id,u.phone,o.id,u.name`
  // let _sql=`SELECT  
  // o.id, 
  // g.id AS goalid,
  // g.type AS goaltype,
  // g.name AS goal_name,
  // e.name AS entry,
  // GROUP_CONCAT(DISTINCT m.name ) AS method,
  // GROUP_CONCAT(DISTINCT p.name) AS purpose,
  // GROUP_CONCAT(DISTINCT c.name)AS clean,
  // o.number,
	// u.name,
	// u.phone,
  // DATE_FORMAT(o.date, '%Y-%m-%d %H:%i:%S') AS date
  // from orders o
  // JOIN datamining_goal g ON FIND_IN_SET(g.id,o.goal_id) 
  // JOIN datamining_method m ON FIND_IN_SET(m.id,o.method_id)
  // JOIN purpose p ON FIND_IN_SET(p.id,o.purpose_id)
  // JOIN dataclean c ON FIND_IN_SET(c.id,o.clean_id)
  // JOIN dataentry e ON o.entry_id=e.id
  // LEFT JOIN user u ON u.id=o.user_id
  // GROUP BY g.id,o.id,u.name`
  let _sql=`
  SELECT 
  u.name,u.phone,u.email,u.deadline,o.id as orderId,o.total,o.date
  FROM  orders o
  JOIN user u
  WHERE u.id=o.user_id
  ORDER BY o.date DESC
  `
  return query(_sql)
}
//某一订单详情
let getOrderDetail=function(id){
  let _sql=`SELECT * FROM orders WHERE id='${id}'`
  return query(_sql)
}
//根据数据目标id查询数据目标
let queryPurposeTypeNum=function(ids){
  let _sql=`
  select p.name as purposeName
  from  purpose p WHERE FIND_IN_SET(p.id,'${ids}')
  `
  return query(_sql)
}

//根据录入id查询
let queryEntryType=function(ids){
  let _sql=`
  select e.name as entryName,
  e.price as price
  from  dataentry e WHERE FIND_IN_SET(e.id,'${ids}')
  `
  return query(_sql)
}

//根据数据清洗id查询
let queryCleanType=function(ids){
  let _sql=`
  select c.name as cleanName,
  c.price as price
  from  dataclean c WHERE FIND_IN_SET(c.id,'${ids}')
  `
  return query(_sql)
}
//根据goal_id字符串查询每个每个类型的数量
 let queryGoalTypeNum=function(ids){
   let _sql=`
   select count(g.type) as count,
   g.type as goalType
   from  datamining_goal g WHERE FIND_IN_SET(g.id,'${ids}')
   GROUP BY g.type`
   return query(_sql)
 }
//根据数据方法id查询
let queryMethodType=function(ids){
  let _sql=`
  select m.name as methodName,
  m.price as price
  from  datamining_method m WHERE FIND_IN_SET(m.id,'${ids}')
  `
  return query(_sql)
}
module.exports = {
  query,
  findAllPurpose,
  findAllEntry,
  findAllCleaning,
  findAllMethods,
  findGoalByType,
  findMethods,
  updateOrder,
  newUser,
  queryCleanPrice,
  queryEntryPrice,
  getOrderDetail,
  getOrderList,
  queryEntryType,
  queryCleanType,
  queryPurposeTypeNum,
  queryGoalTypeNum,
  queryMethodType
}