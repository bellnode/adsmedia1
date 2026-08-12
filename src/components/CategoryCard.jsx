import { Link } from 'react-router-dom';
import { useI18n } from '../i18n.jsx';
import SocialPlatformIcon from './SocialPlatformIcon.jsx';
import ChallengeGameIcon from './ChallengeGameIcon.jsx';
import { TaskTypeIcon, IconCoin, IconCheck, IconStar, IconUser, IconChart, IconCalendar, IconGift, IconTasks } from './AppIcons.jsx';

const ROW_ICON = {
  star: IconStar,
  user: IconUser,
  chart: IconChart,
  check: IconCheck,
  calendar: IconCalendar,
  gift: IconGift,
};

export default function CategoryCard({ cat, items = [], footer, planBar, extra }) {
  const { t } = useI18n();
  const CatIcon = cat.Icon || IconTasks;

  return (
    <div className="cat-card">
      <div className="cat-head navy-cat-head" style={{ background: cat.color }}>
        {cat.num != null && <span className="cat-num">{cat.num}</span>}
        <span className="cat-ic-svg"><CatIcon size={26} /></span>
        <div>
          <div className="cat-title">{t(cat.titleKey)}</div>
          <div className="cat-sub">{t(cat.subKey)}</div>
        </div>
      </div>
      <div className="cat-body">
        {extra}
        {items.map((item, i) => (
          <div className="cat-row" key={i}>
            {item.platform ? (
              <SocialPlatformIcon platform={item.platform} size={32} className="cat-row-plat" />
            ) : item.game ? (
              <ChallengeGameIcon game={item.game} size={32} className="cat-row-game" />
            ) : item.icType === 'task' ? (
              <span className="cat-row-ic-svg"><TaskTypeIcon type={item.ic} size={16} /></span>
            ) : (() => {
              const Ic = ROW_ICON[item.ic] || IconTasks;
              return <span className="cat-row-ic-svg"><Ic size={16} /></span>;
            })()}
            <div className="cat-row-txt">
              <div className="cat-row-name">{item.name}</div>
              {item.sub && <div className="cat-row-sub">{item.sub}</div>}
            </div>
            <div className="cat-row-right">
              {item.reward != null && (
                <span className="cat-coin"><IconCoin size={12} /> +{item.reward}</span>
              )}
              {item.progress != null && (
                <span className="cat-prog">{item.progress}</span>
              )}
              {item.done && <span className="cat-check"><IconCheck size={14} /></span>}
              {item.link && (
                <Link to={item.link} className="btn xs cat-play">{item.btn || t('play')}</Link>
              )}
              {typeof item.claim === 'function' && !item.done && (
                <button type="button" className="btn xs cat-play cat-claim" onClick={item.claim}>{t('claim')}</button>
              )}
            </div>
          </div>
        ))}
        {planBar}
      </div>
      {footer && (
        <div className="cat-foot navy-cat-foot" style={{ background: cat.colorLight, color: cat.color }}>
          {typeof footer === 'string' ? footer : t(cat.footerKey)}
        </div>
      )}
      <Link to={cat.path} className="cat-view-all">{t('viewAll')} →</Link>
    </div>
  );
}
