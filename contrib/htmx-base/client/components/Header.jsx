import Html from '@kitajs/html'
import styles from './Header.module.css'

export default ({ text }) => {
  return <h1 class={`${styles.header} text-yellow-200`}>{text}</h1>
}
