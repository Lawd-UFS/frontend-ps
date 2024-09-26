//mudança de sessão durante o cadastro:
let icon = 1;

const section1Icon = document.getElementById('section1-icon');
const section2Icon = document.getElementById('section2-icon');
const section3Icon = document.getElementById('section3-icon');

const section1 = document.getElementById('section1');
const section2 = document.getElementById('section2');
const section3 = document.getElementById('section3');

const sectionName = document.getElementById('section-name')

const changeSection = () => {
    if(icon === 1){
        section1Icon.src = "../images/section-off.png";
        section2Icon.src = "../images/section-on.png";
        section3Icon.src = "../images/section-off.png";

        section1.style.display = "none";
        section2.style.display = "block";
        section3.style.display = "none";

        sectionName.innerText = "parte2";

        icon++;
    }
    else if(icon === 2){
        section1Icon.src = "../images/section-off.png";
        section2Icon.src = "../images/section-off.png";
        section3Icon.src = "../images/section-on.png";

        section1.style.display = "none";
        section2.style.display = "none";
        section3.style.display = "block";

        sectionName.innerText = "parte3";

        icon++;
    }
    else{
        section1Icon.src = "../images/section-on.png";
        section2Icon.src = "../images/section-off.png";
        section3Icon.src = "../images/section-off.png";

        section1.style.display = "block";
        section2.style.display = "none";
        section3.style.display = "none";

        sectionName.innerText = "Dados básicos";

        icon = 1;
    }
}

//mudança de sessão direta (ao clicar no icon):
section1Icon.addEventListener('click', () => {
    icon = 3; 
    changeSection();
});
section2Icon.addEventListener('click', () => {
    icon = 1; 
    changeSection();
});
section3Icon.addEventListener('click', () => {
    icon = 2; 
    changeSection();
});