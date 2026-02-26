<template>
  <nav>
    <ul>
      <li>超级</li>
      <li>好玩的</li>
      <li>下划线</li>
      <li>Hover动画</li>
      <li>下面的</li>
      <li>也是</li>
    </ul>
  </nav>
  <el-divider></el-divider>
  <div id="content">
    <div class="main">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <code>HOVER</code>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
nav {
  width: 100%;
  height: 50px;
  margin: 0 auto;
  display: flex;
  justify-content: space-evenly;

  ul {
    height: 50px;
    list-style: none;

    li {
      line-height: 50px;
      cursor: pointer;
      float: left;
      padding: 0 20px;
      position: relative;
      transition: all .3s;
    }

    li::before {
      content: "";
      position: absolute;
      top: 0;
      left: 100%;
      width: 0;
      height: 100%;
      border-bottom: 2px solid #000;
      transition: all .3s;
      z-index: -1;
    }

    li:hover {
      color: #fff;
    }

    li:hover::before {
      width: 100%;
      left: 0;
      background-color: rgba(23, 48, 51, .5);
    }

    li:hover~li:before {
      left: 0;
    }

    .cur {
      background: rgba(23, 48, 51, .5);
      border-bottom: 2px solid #000;
      color: #fff;
    }
  }
}

#content {
  box-sizing: border-box;

  .main {
    margin: 15px auto;
    width: 200px;
    height: 200px;
    line-height: 200px;
    text-align: center;
    transition: .5s;
    position: relative;
  }

  .main code {
    font-family: fantasy;
    font-size: 30px;
    cursor: default;
    color: #404040;
    transition: all .4s;
    transform: scale(1);
  }

  .main:hover code {
    color: #ff0000;
    transform: scale(1.1);
    text-shadow: 2px 2px 6px #929292;
  }

  .main span {
    position: absolute;
    transition: transform .5s;
  }

  /* 上下两个边框 */
  .main span:nth-child(1),
  .main span:nth-child(3) {
    width: 100%;
    height: 3px;
    background-color: #404040;
  }

  .main span:nth-child(1) {
    top: 0;
    left: 0;
    transform-origin: right;
  }

  .main span:nth-child(3) {
    bottom: 0;
    right: 0;
    transform-origin: left;
  }

  .main:hover span:nth-child(1) {
    transform: scale(0);
    transform-origin: left;
  }

  .main:hover span:nth-child(3) {
    transform: scale(0);
    transform-origin: right;
  }

  /* 左右两个边框 */
  .main span:nth-child(2),
  .main span:nth-child(4) {
    height: 100%;
    width: 3px;
    background-color: #404040;
  }

  .main span:nth-child(2) {
    top: 0;
    left: 0;
    transform: scale(0);
    transform-origin: bottom;
  }

  .main span:nth-child(4) {
    bottom: 0;
    right: 0;
    transform: scale(0);
    transform-origin: top;
  }

  .main:hover span:nth-child(2) {
    transform: scale(1);
    transform-origin: top;
  }

  .main:hover span:nth-child(4) {
    transform: scale(1);
    transform-origin: bottom;
  }
}
</style>
