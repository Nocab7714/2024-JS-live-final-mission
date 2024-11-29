import{c as p,m as y}from"./methods-00fb6781.js";const{token:M,baseUrl:w,apiPath:D,adminApi:P,Toast:c,adminInstance:d}=p,{formatTime:B}=y;let a=[];function u(){d.get("/orders").then(e=>{a=e.data.orders,a.sort((t,n)=>n.createdAt-t.createdAt),a.length===0?l.classList.add("disabled"):l.classList.remove("disabled"),S(),h()}).catch(e=>{console.log(e.message)})}const f=document.querySelector(".orderPage-table tbody");function S(){if(a.length===0){f.innerHTML='<tr><td colspan="8">目前沒有任何訂單喔！</td></tr>';return}let e="";a.forEach(t=>{let n="";t.products.forEach(s=>{n+=`<p>${s.title} x ${s.quantity}</p>`}),e+=`<tr data-id="${t.id}">
              <td>${t.id}</td>
              <td>
                <p>${t.user.name}</p>
                <p>${t.user.tel}</p>
              </td>
              <td>${t.user.address}</td>
              <td>${t.user.email}</td>
              <td>
                ${n}
              </td>
              <td>${B(t.createdAt)}</td>
              <td class="orderStatus">
                <a href="#">${t.paid?'<span style="color: green">已處理</span>':'<span style="color: red">未處理</span>'}
              </a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" />
              </td>
            </tr>`}),f.innerHTML=e}function T(e){d.delete(`/orders/${e}`).then(t=>{c.fire({icon:"success",title:"成功刪除訂單！"}),u()}).catch(t=>{c.fire({icon:"error",title:"刪除訂單失敗!"}),console.log(t.message)})}f.addEventListener("click",e=>{if(e.preventDefault(),e.target.matches(".delSingleOrder-Btn"))Swal.fire({title:"刪除訂單",text:"你確定要該筆訂單嗎?",icon:"warning",showCancelButton:!0,confirmButtonText:"確定",cancelButtonText:"取消"}).then(t=>{if(t.isConfirmed){const n=e.target.closest("tr").dataset.id;e.target.classList.add("disabled"),T(n)}});else if(e.target.matches(".orderStatus a span")){const t=e.target.closest("tr").dataset.id;L(t)}});const l=document.querySelector(".discardAllBtn");function E(){d.delete("/orders").then(e=>{c.fire({icon:"success",title:"成功刪除全部訂單！"}),u()}).catch(e=>{c.fire({icon:"error",title:"刪除全部訂單失敗!"}),console.log(e.message)})}l.addEventListener("click",e=>{e.preventDefault(),Swal.fire({title:"刪除全部訂單",text:"你確定要全部的訂單嗎? 刪除後將無法回復訂單資料!",icon:"warning",showCancelButton:!0,confirmButtonText:"確定",cancelButtonText:"取消"}).then(t=>{t.isConfirmed&&(E(),l.classList.add("disabled"))})});function L(e){let t=a.filter(s=>s.id===e)[0].paid,n={data:{id:e,paid:!t}};d.put("/orders/",n).then(s=>{c.fire({icon:"success",title:"成功更新訂單狀態！"}),u()}).catch(s=>{c.fire({icon:"error",title:"更新訂單狀態失敗！"}),console.log(s)})}function h(){const e={};a.forEach(t=>{t.products.forEach(n=>{e[n.category]===void 0?e[n.category]=n.price*n.quantity:e[n.category]+=n.price*n.quantity})}),m(Object.entries(e))}function b(){const e={};a.forEach(i=>{i.products.forEach(r=>{e[r.title]===void 0?e[r.title]=r.price*r.quantity:e[r.title]+=r.price*r.quantity})});const n=Object.entries(e).sort((i,r)=>r[1]-i[1]),s=[];let g=0;n.forEach((i,r)=>{r<=2?s.push(i):r>2&&(g+=i[1])}),n.length>3&&s.push(["其他",g]),m(s)}function m(e){c3.generate({bindto:"#chart",color:{pattern:["#DACBFF","#9D7FEA","#5434A7","#301E5F"]},data:{type:"pie",columns:e}})}function A(){const e=document.querySelector(".section-title");e.textContent==="全產品類別營收比重"?(e.textContent="全品項營收比重",b()):e.textContent==="全品項營收比重"&&(e.textContent="全產品類別營收比重",h())}const C=document.querySelector(".toggleChartBtn");C.addEventListener("click",e=>{e.preventDefault(),A()});function O(){u()}O();let q=document.querySelector(".menuToggle"),$=document.querySelectorAll(".topBar-menu a"),o=document.querySelector(".topBar-menu");q.addEventListener("click",x);$.forEach(e=>{e.addEventListener("click",k)});function x(){o.classList.contains("openMenu")?o.classList.remove("openMenu"):o.classList.add("openMenu")}function k(){o.classList.remove("openMenu")}
