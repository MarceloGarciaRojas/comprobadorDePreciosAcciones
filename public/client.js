'use strict';

const result = document.getElementById('result');

document
  .getElementById('single-stock-form')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    const form = event.target;
    const stock = form.stock.value;
    const like = form.like.checked;

    let url = `/api/stock-prices?stock=${encodeURIComponent(stock)}`;

    if (like) {
      url += '&like=true';
    }

    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        result.textContent = JSON.stringify(data, null, 2);
      });
  });

document
  .getElementById('two-stock-form')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    const form = event.target;
    const stock1 = form.stock1.value;
    const stock2 = form.stock2.value;
    const like = form.like.checked;

    let url =
      `/api/stock-prices?stock=${encodeURIComponent(stock1)}` +
      `&stock=${encodeURIComponent(stock2)}`;

    if (like) {
      url += '&like=true';
    }

    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        result.textContent = JSON.stringify(data, null, 2);
      });
  });