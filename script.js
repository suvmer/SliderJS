"use strict";

/* ПОВЕДЕНИЕ СЛАЙДЕРА:
При свайпе от центра более, чем на 1/6 от ширины изображения, при отжатии
 слайдер пролистает до соседней картинки.
Если свайп мышкой ушёл дальше соседей, при отжатии
 слайдер притянет картинку, на которую смотрит центр его блока.

Преимущества:
Легко листается на ПК(обработкой событий) и на телефоне(media запросом с scroll-snap-align)
*/

window.onload = () => {
    var onOpen = (url) => {
        //openImage(url) //ex: show Image modal to user
        console.log("opened " + url);
    }

    const sliderWrapper = document.querySelector(".slider");
    const slider = document.querySelector(".slider__body");
    const [arrowLeft, arrowRight] = document.querySelectorAll(".slider__arrow");
    let startPos = null; //состояние на момент нажатия слайдера
    
    //ширина картинок внутри слайдера
    let widths = [...slider.children].map(el => el.clientWidth);
    sliderWrapper.style.cssText = `width: ${Math.max(...widths)}px;`;

    let imgCount = slider.children.length;
    let offsetStart = slider.clientWidth/2 - slider.children[0].clientWidth/2;
    let offsetEnd = slider.clientWidth/2 - slider.children[imgCount-1].clientWidth/2;
    slider.children[0].style.cssText = `margin-left: ${offsetStart}px;`;
    slider.children[imgCount-1].style.cssText = `margin-right: ${offsetEnd}px;`;

    let startPoints = [];
    [...slider.children].reduce((acc, el) => {
        startPoints.push(acc + el.clientWidth/2); //относительные координаты середин слайдов
        return acc + el.clientWidth;
    }, offsetStart);

    /**
     * Возвращает индекс картинки, на которую попадает центр окна слайдера
     * @returns индекс
     */
    function getCur() {
        return [...slider.children].reduce((prev, el, ind) => {
            let viewPos = slider.scrollLeft + slider.clientWidth/2;
            return (startPoints[ind] - widths[ind]/2 <= viewPos && startPoints[ind] + widths[ind]/2 >= viewPos ? ind : prev);
        }, 0);
    }
    /**
     * Возвращает индекс соседа, в сторону которого отклонился
     *  центр слайдера более, чем на 1/6 от ширины картинки.
     * Если отклонение менее 1/6, возвращается текущее изображение
     * @returns индекс
     */
    function getClosest(cur = getCur()) {
        const wind = slider.scrollLeft + slider.clientWidth/2;
        if(wind <= startPoints[cur] - slider.children[cur].clientWidth/6)
            return Math.max(0, cur-1);
        if(wind >= startPoints[cur] + slider.children[cur].clientWidth/6)
            return Math.min(imgCount-1, cur+1);
        return cur;
    }
    /**
     * Выравнивает слайдер согласно текущем положению
     * @param {number} cur Слайд до начала скролла
     * @param {number?} dir Принудительно указать направление движения
     */
    const move = (cur, dir = null) => {
        let index = getCur(); //индекс картинки, на который двигать
        if(index === cur) //если центр попал на ту же картинку
            index = getClosest(cur); //то может сдвига достаточно для соседа
        if(dir) //если принудительно указано направление
            index = cur + dir;
        slider.scrollTo({left: startPoints[index] - slider.clientWidth/2, top: 0, behavior: "smooth"});
    }

    //startPos = [x, y, скролл слайдера на момент нажатия, наведённый слайд на момент нажатия]
    function mouseDown(event) {
        event.preventDefault();
        startPos = [event.clientX, event.clientY, slider.scrollLeft, getCur()];
        slider.classList.add('grabbing');
    }
    function mouseUp(event) {
        if(!startPos)
            return;
        if(dist(startPos[0], startPos[1], event.clientX, event.clientY) < 30)
            onOpen(slider.children[startPos[3]].src);
        move(startPos[3]);
        startPos = null;
        slider.classList.remove('grabbing');
    }
    function mouseOut(event) {
        if(!startPos)
            return;
        if(dist(startPos[0], startPos[1], event.clientX, event.clientY) >= 30)
            move(startPos[3]);
        startPos = null;
        slider.classList.remove('grabbing');
    }
    function dist(x1, y1, x2, y2) {
        return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    }
    function mouseMove(event) {
        event.preventDefault();
        if(!startPos)
            return;
        const dx = startPos[0] - event.clientX;
        slider.scrollTo({left: startPos[2] + 2*dx, top: 0});
    }
    slider.addEventListener('mousemove', mouseMove)
    slider.addEventListener('mouseout', mouseOut)
    slider.addEventListener('mousedown', mouseDown)
    slider.addEventListener('mouseup', mouseUp)
    arrowLeft.addEventListener('click', () => move(getCur(), -1))
    arrowRight.addEventListener('click', () => move(getCur(), 1))
}