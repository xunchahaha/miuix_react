// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { Badge, BadgedBox } from "../../miuix";
import { OfficialIcon } from "../../miuix/official-icons";
import { DemoCard, DemoSection } from "../section";

export function BadgeSection() {
  return (
    <DemoSection title="徽标">
      <DemoCard inset>
        <div className="demo-badge-row">
          <BadgedBox badge={<Badge />}>
            <OfficialIcon className="miuix-icon" name="Messages" size={28} />
          </BadgedBox>
          <BadgedBox badge={<Badge>8</Badge>}>
            <OfficialIcon className="miuix-icon" name="Email" size={28} />
          </BadgedBox>
          <BadgedBox badge={<Badge>99+</Badge>}>
            <OfficialIcon className="miuix-icon" name="Settings" size={28} />
          </BadgedBox>
          <BadgedBox badge={<Badge>5</Badge>}>
            <OfficialIcon className="miuix-icon" name="Favorites" size={28} />
          </BadgedBox>
        </div>
      </DemoCard>
    </DemoSection>
  );
}
