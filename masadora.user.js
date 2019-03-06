// ==UserScript==
// @name         masadora
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  bad guys
// @author       fifth
// @match        http://www.masadora.net/order/carriage/print/*.htm
// @grant        none
// ==/UserScript==

'use strict';

(() => {
    const controlPanel = document.getElementById('printControl');
    const report = (summary) => {
        let totalPrice = 0;
        let totalNumber = 0;
        console.log('summary:');
        Object.entries(summary).forEach(el => {
            const price = el[0];
            const number = el[1].length;
            console.log(`price: ${price}円, number: ${number}件`);
            totalNumber += number;
            totalPrice += price * number;
        });
        console.log('total:');
        console.log(`total price: ${totalPrice}円, total number: ${totalNumber}件`);
    };
    const editFinish = () => {
        const storage = {};
        const tables = document.querySelectorAll('table.data-table');
        tables.forEach(elem => {
            // i从1开始，跳过表头
            for (let i = 1; i < elem.rows.length; i++) {
                if (i === 0) {
                    continue;
                }
                const row = elem.rows[i];
                const name = row.cells[0].innerText;
                const number = row.cells[1].innerText - 0;
                const singlePriceBlock = row.cells[2];
                const oldPrice = singlePriceBlock.innerText.replace(/\D/g, '') - 0;
                if (storage[oldPrice]) {
                    for (let i = 0; i < number; i++) {
                        storage[oldPrice].push(name);
                    }
                } else {
                    storage[oldPrice] = [name];
                }
            }
        });

        report(storage);
    };
    const enableEditMode = () => {
        document.querySelectorAll('table.data-table td:nth-child(3)').forEach(el => {
            el.className = 'item-price';
            el.contentEditable = true;
            el.oninput = e => {
                const singlePriceBlock = e.target;
                const number = singlePriceBlock.parentElement.cells[1].innerText - 0;
                const totalPriceBlock = singlePriceBlock.parentElement.cells[6];
                const newPriceText = singlePriceBlock.innerText;
                const newPrice = newPriceText.replace(/\D/g, '') - 0;
                singlePriceBlock.innerText = newPrice + '円';
                totalPriceBlock.innerText = number * newPrice + '円';
            };
        });
    };
    const priceChanged = () => {
        enableEditMode();
        const btn = document.getElementById('printControl-switch');
        const input = document.getElementById('printControl-rate');
        btn.value = '查看报告';
        btn.onclick = editFinish;
        controlPanel.removeChild(input);
    };
    const changePrice = () => {
        const rate = document.getElementById('printControl-rate').value;
        const tables = document.querySelectorAll('table.data-table');
        tables.forEach(elem => {
            // i从1开始，跳过表头
            for (let i = 1; i < elem.rows.length; i++) {
                if (i === 0) {
                    continue;
                }
                const row = elem.rows[i];
                const name = row.cells[0].innerText;
                const number = row.cells[1].innerText - 0;
                const singlePriceBlock = row.cells[2];
                const deliverPriceBlock = row.cells[3];
                const totalPriceBlock = row.cells[6];
                const oldPrice = singlePriceBlock.innerText.replace(/\D/g, '') - 0;
                const newPrice = Math.floor(oldPrice * rate);
                deliverPriceBlock.innerText = '0円';
                singlePriceBlock.innerText = newPrice + '円';
                totalPriceBlock.innerText = number * newPrice + '円';
            }
        });

        // 去掉国内运费，国际运费不改动
        const deliverSummaryTable = document.querySelectorAll('table.price-info')[1];
        deliverSummaryTable.rows[0].cells[1].innerText = '0 円';
        deliverSummaryTable.rows[2].cells[1].innerText = deliverSummaryTable.rows[1].cells[1].innerText;

        priceChanged();
    };
    const prepare = () => {
        const newBtn = document.createElement('input');
        newBtn.id = 'printControl-switch';
        newBtn.type = 'button';
        newBtn.value = '一键改价';
        newBtn.onclick = changePrice;
        controlPanel.prepend(newBtn);
        const newInput = document.createElement('input');
        newInput.id = 'printControl-rate';
        newInput.value = 0.5; // 默认系数0.5，可以自己改
        newInput.style.width = '25px';
        controlPanel.prepend(newInput);
    };
    (() => {
        prepare();
    })()
})();
