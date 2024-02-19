import Html from '@kitajs/html'
import styles from './Header.module.css'

export interface LayoutProps extends Html.PropsWithChildren {
  text: string
}

export default ({ text }: LayoutProps) => {
  return <h1 class={`${styles.header} text-yellow-200`}>{text}</h1>
}
