<template>
  <a class="hlm-callout" href="https://hire.jonasgalvez.com.br/happy-little-monoliths">
    <span>The book is out!</span>
    <img src="/cover-hlm.png">
  </a>
</template>

<script setup>
</script>

<style scoped>
.hlm-callout {
  display: block;
  margin-right: 2em;
  margin-bottom: 3em;
  display: flex;
  flex-direction: column;
  align-items: center;
  span {
    display: block;
    margin-left: 0;
    background: #e51784;
    border-radius: 50px;
    padding: 10px 20px;
    color: #fff;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 1em;
    align-self: flex-start;
    @media (max-width: 960px) {
      align-self: unset;      
    }
  }
  img {
    border: 3px solid #e51784;
    width: 250px;
  }
}
</style>