//menu da página entrevista = linha 1 a 56:
let session = 1;

const application = document.getElementById('application');
const about = document.getElementById('about');
const result = document.getElementById('result');

const CApp = document.querySelector('.content-application');
const CAbt = document.querySelector('.content-about');
const CRes = document.querySelector('.content-result');

const changeSession = () => {
    if(session === 2){
        application.classList.remove('interview-select');
        about.classList.add('interview-select');
        result.classList.remove('interview-select');

        CApp.style.display = 'none';
        CRes.style.display = 'none';
        CAbt.style.display = 'flex';
    }

    else if(session === 3){
        about.classList.remove('interview-select');
        result.classList.add('interview-select');
        application.classList.remove('interview-select');

        CApp.style.display = 'none';
        CRes.style.display = 'flex';
        CAbt.style.display = 'none';
    }

    else if(session === 1){
        result.classList.remove('interview-select');
        application.classList.add('interview-select');
        about.classList.remove('interview-select');

        CApp.style.display = 'flex';
        CRes.style.display = 'none';
        CAbt.style.display = 'none';
    }
}

//mudar sessão (ao clicar):
about.addEventListener('click', () => {
    session = 2;
    changeSession();
})
result.addEventListener('click', () => {
    session = 3;
    changeSession();
})
application.addEventListener('click', () => {
    session = 1;
    changeSession();
})


