import React,{createContext,useContext,useEffect,useState} from 'react';
import {installUiTranslation} from './uiTranslations';

export const LANGUAGE_OPTIONS=[
 {key:'bn',label:'বাংলা',short:'বাং'},
 {key:'en',label:'English',short:'EN'},
 {key:'bi',label:'বাংলা + English',short:'BI'}
];

export const I18nContext=createContext({lang:'bi',setLang:()=>{}});
export function LanguageProvider({children}){
 const [lang,setLangState]=useState(()=>localStorage.getItem('magra_lang')||'bi');
 const setLang=(next)=>{setLangState(next);localStorage.setItem('magra_lang',next);window.dispatchEvent(new CustomEvent('magra-language',{detail:next}))};
 useEffect(()=>{document.documentElement.lang=lang==='en'?'en':'bn';document.documentElement.dataset.uiLanguage=lang;installUiTranslation(lang)},[lang]);
 return <I18nContext.Provider value={{lang,setLang}}>{children}</I18nContext.Provider>;
}
export function useLanguage(){return useContext(I18nContext)}
export function bilingual(bn,en,lang){if(lang==='en')return en||bn;if(lang==='bi'&&en)return <><span>{bn}</span><small className="lang-secondary">{en}</small></>;return bn}
export function LanguageSwitcher(){
 const {lang,setLang}=useLanguage();
 return <div className="language-switcher" aria-label="Language / ভাষা">
  {LANGUAGE_OPTIONS.map(x=><button key={x.key} type="button" className={lang===x.key?'active':''} onClick={()=>setLang(x.key)} title={x.label}>{x.short}</button>)}
 </div>
}
